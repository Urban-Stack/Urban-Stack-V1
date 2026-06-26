package net.teuto.udh

import com.expediagroup.graphql.generator.annotations.GraphQLDescription
import com.google.gson.GsonBuilder
import com.google.gson.JsonObject
import io.kubernetes.client.openapi.ApiException
import io.kubernetes.client.openapi.Configuration
import io.kubernetes.client.openapi.JSON
import io.kubernetes.client.openapi.apis.CoreV1Api
import io.kubernetes.client.openapi.apis.NetworkingV1Api
import io.kubernetes.client.openapi.models.V1ObjectMeta
import io.kubernetes.client.openapi.models.V1Secret
import io.kubernetes.client.util.Config
import io.kubernetes.client.util.generic.dynamic.DynamicKubernetesApi
import io.kubernetes.client.util.generic.dynamic.DynamicKubernetesObject
import jakarta.ws.rs.BadRequestException
import jakarta.ws.rs.ClientErrorException
import jakarta.ws.rs.ForbiddenException
import jakarta.ws.rs.NotFoundException
import jakarta.ws.rs.core.Response
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream
import net.teuto.udh.UdhSharedApp.Companion.getDynamicHelmClient
import net.teuto.udh.UdhSharedApp.Companion.sharedAppsNamespace
import net.teuto.udh.UdhSharedApp.SharedAppConfig
import org.keycloak.authorization.attribute.Attributes
import org.keycloak.authorization.common.UserModelIdentity
import org.keycloak.authorization.identity.Identity
import org.keycloak.authorization.model.Resource
import org.keycloak.representations.idm.ClientRepresentation
import org.keycloak.representations.idm.ProtocolMapperRepresentation
import org.keycloak.services.managers.ClientManager
import org.keycloak.services.managers.RealmManager
import org.keycloak.services.resources.admin.permissions.AdminPermissions
import java.lang.System.getenv
import java.util.*

val SENSOR_CREDENTIAL_TYPE = ResourceType(
    resourceTypeName = "sensor-credential",
    specificOwnScopes = listOf("rotate"),
    attributesToModel = UdhSensorCredential::fromAttributes
)

val SENSOR_SUBSCRIPTION_TYPE = ResourceType(
    resourceTypeName = "sensor-subscription",
    attributesToModel = UdhSensorSubscription::fromAttributes
)

val DATASET_TYPE = ResourceType(
    resourceTypeName = "dataset",
    specificOwnScopes = listOf("refresh"),
    attributesToModel = UdhDataset::fromAttributes
)

val DASHBOARD_TYPE = ResourceType(
    resourceTypeName = "dashboard",
    attributesToModel = UdhDashboard::fromAttributes
)

val PUBLISHED_QUERY_TYPE = ResourceType(
    resourceTypeName = "published-query",
    attributesToModel = UdhPublishedQuery::fromAttributes
)

val CITYTOOL_TYPE = ResourceType(
    resourceTypeName = "citytool",
    attributesToModel = UdhCitytool::fromAttributes
)

val SHARED_APP_TYPE = ResourceType(
    resourceTypeName = "shared-app",
    attributesToModel = UdhSharedApp::fromAttributes
)

val DEDICATED_APP_TYPE = ResourceType(
    resourceTypeName = "dedicated-app",
    attributesToModel = UdhDedicatedApp::fromAttributes
)

val VIZ_GROUP_TYPE = ResourceType(
    resourceTypeName = "viz-group",
    allowedAsPrincipal = true,
    children = listOf(
        DASHBOARD_TYPE,
        PUBLISHED_QUERY_TYPE
    ),
    attributesToModel = UdhVizGroup::fromAttributes
)

val PROJECT_TYPE = ResourceType(
    resourceTypeName = "project",
    specificOwnScopes = listOf(
        "clickhouse-read",
        "bucket-read",
        "bucket-write",
        "sensor-metadata-read",
        "sensor-metadata-write",
    ),
    allowedAsPrincipal = true,
    children = listOf(
        SENSOR_CREDENTIAL_TYPE,
        SENSOR_SUBSCRIPTION_TYPE,
        DATASET_TYPE
    ),
    attributesToModel = UdhProject::fromAttributes
)

val GROUP_TYPE = ResourceType(
    resourceTypeName = "group",
    attributesToModel = UdhGroup::fromAttributes
)

val TENANT_TYPE = ResourceType(
    resourceTypeName = "tenant",
    specificOwnScopes = listOf(
        "discourse-member",
        "discourse-moderator",
        "ckan-admin",
        "ckan-editor",
        "ckan-member"
    ),
    children = listOf(
        GROUP_TYPE,
        PROJECT_TYPE,
        VIZ_GROUP_TYPE,
        CITYTOOL_TYPE,
        SHARED_APP_TYPE,
        DEDICATED_APP_TYPE
    ),
    attributesToModel = UdhTenant::fromAttributes
)

val ROOT_TYPE = ResourceType(
    resourceTypeName = "root",
    children = listOf(
        TENANT_TYPE
    ),
    attributesToModel = { _ -> UdhRoot() }
)

@Serializable
sealed interface UdhPrincipal {
    fun getIdentity(ctx: AuthzContext): Identity
}

@Serializable
sealed interface UdhResourceModel : UdhPrincipal {
    val path: ResourcePath

    fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ): Any? {
        return null
    }

    fun postDelete(ctx: AuthzContext, delayedActionsList: DelayedActionsList): Any? {
        return null
    }

    fun postAttributeChange(ctx: AuthzContext, delayedActionsList: DelayedActionsList, resource: UdhResource<*>) {

    }

    fun customAction(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        action: String,
        body: String?,
        resource: UdhResource<*>
    ): Any? {
        throw NotFoundException()
    }

    override fun getIdentity(ctx: AuthzContext): Identity {
        return AttributeIdentity(
            Attributes.from(
                mapOf(
                    DATA_HUB_RESOURCE_KEY to listOf(path.toHash()),
                    // is overwritten for groups and tenants, only applies when resources like viz-groups are principals
                    DATA_HUB_BYPASS_PARENT_CHECK to listOf("1"),
                    "data-hub.attribute.groups" to listOf("")
                )
            )
        )
    }
}


@Serializable
@SerialName("user")
class UdhUserPrincipal(val userId: String) : UdhPrincipal {
    override fun getIdentity(ctx: AuthzContext): Identity {
        val user = ctx.session.users().getUserById(ctx.realm, userId)
        return UserModelIdentity(ctx.realm, user)
    }
}

@Serializable
@SerialName("allAuthenticatedUsers")
class UdhAllAuthenticatedUsersPrincipal : UdhPrincipal {
    override fun getIdentity(ctx: AuthzContext): Identity {
        return AttributeIdentity(Attributes.from(mapOf()))
    }
}

class UdhRoot : UdhResourceModel {
    override val path = ResourcePath()
}

val COLOR_RE = Regex("^[0-9a-f]{6}$")

fun ignoreConflicts(f: () -> Unit) {
    try {
        f()
    } catch (e: ClientErrorException) {
        if (e.response.status != Response.Status.CONFLICT.statusCode)
            throw e
    }
}

@Serializable
@SerialName("tenant")
data class UdhTenant(val tenant: String) : UdhResourceModel, UdhPrincipal {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhTenant {
            val tenant = attributes["tenant"]!!.first()
            return UdhTenant(tenant)
        }

        const val ATTR_CITIZEN_HUB_IMAGE = "citizen-hub-image"
        const val ATTR_DISPLAY_NAME = "tenant-name"
    }

    override val path: ResourcePath
        get() = ResourcePath(listOf(TENANT_TYPE.resourceTypeName to tenant))

    override fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ) {
        val tenantGroup =
            ctx.realm.getGroupById(tenantGroupId(tenant)) ?: ctx.realm.createGroup(tenantGroupId(tenant), tenant)
        val mgmtPermissions = AdminPermissions.management(ctx.session, ctx.realm)
        mgmtPermissions.groups().setPermissionsEnabled(tenantGroup, true)
        tenantGroup.grantRole(mgmtPermissions.realmManagementClient.getRole("query-users"))
        tenantGroup.grantRole(mgmtPermissions.realmManagementClient.getRole("query-groups"))

        // add admin group
        ignoreConflicts { executeAction(path, Action.Create("group", "admin"), ctx, delayedActionsList, null) }
        // add admin permission
        executeAction(
            path,
            Action.CreatePermission("admin", listOf("tenant:admin"), listOf(UdhGroup(tenant, "admin")), false),
            ctx,
            delayedActionsList, null
        )
        // add read group
        ignoreConflicts { executeAction(path, Action.Create("group", "read"), ctx, delayedActionsList, null) }
        // add read permission
        executeAction(
            path,
            Action.CreatePermission("read", listOf("tenant:read"), listOf(UdhGroup(tenant, "read")), false),
            ctx,
            delayedActionsList, null
        )
        // add ckan-editor group
        ignoreConflicts { executeAction(path, Action.Create("group", "ckan-editor"), ctx, delayedActionsList, null) }
        // add read permission
        executeAction(
            path,
            Action.CreatePermission("ckan-editor", listOf("tenant:ckan-editor"), listOf(UdhGroup(tenant, "ckan-editor")), false),
            ctx,
            delayedActionsList, null
        )
        // add view permission
        executeAction(
            path,
            Action.CreatePermission(
                "members",
                listOf("citytool:view", "dedicated-app:view",  "tenant:view", "tenant:discourse-member", "tenant:ckan-member"),
                listOf(this),
                false
            ),
            ctx,
            delayedActionsList, null
        )
        // everyone can see that the tenant exists
        executeAction(
            path,
            Action.CreatePermission(
                "public",
                listOf("tenant:view"),
                listOf(UdhAllAuthenticatedUsersPrincipal()),
                false
            ),
            ctx,
            delayedActionsList, null
        )

        val udhDiscourseTenant = UdhDiscourseTenant.fromTenant(this, resource)

        val citizenHubImage = resource.customAttribute(ATTR_CITIZEN_HUB_IMAGE)

        delayedActionsList.changes.add {
            getDiscourseClient()?.upsertForTenant(udhDiscourseTenant)
            createCkanOrg(tenant, udhDiscourseTenant.displayName ?: tenant, citizenHubImage)
        }
    }

    override fun postAttributeChange(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>
    ) {
        val udhDiscourseTenant = UdhDiscourseTenant.fromTenant(this, resource)

        val citizenHubImage = resource.customAttribute(ATTR_CITIZEN_HUB_IMAGE)

        delayedActionsList.changes.add {
            getDiscourseClient()?.upsertForTenant(udhDiscourseTenant)
            createCkanOrg(tenant, udhDiscourseTenant.displayName ?: tenant, citizenHubImage)
        }
    }

    override fun postDelete(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList
    ) {
        ctx.realm.getGroupById(tenantGroupId(tenant))?.let(ctx.realm::removeGroup)

        delayedActionsList.changes.add {
            getDiscourseClient()?.deleteForTenant(tenant)
            deleteCkanOrg(tenant)
        }
    }

    override fun getIdentity(ctx: AuthzContext): Identity {
        return AttributeIdentity(
            Attributes.from(mapOf("data-hub.attribute.groups" to listOf("/${tenant}")))
        )
    }
}

@Serializable
@SerialName("project")
data class UdhProject(val tenant: String, val project: String) : UdhResourceModel, UdhPrincipal {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhProject {
            val tenant = attributes["tenant"]!!.first()
            val project = attributes["project"]!!.first()
            return UdhProject(tenant, project)
        }

        const val BUCKET_MAX_LENGTH = 63
    }

    override val path: ResourcePath
        get() = ResourcePath(listOf(TENANT_TYPE.resourceTypeName to tenant, PROJECT_TYPE.resourceTypeName to project))

    val flatName get() = "$tenant.$project"

    fun ensureNamedCollection() {
        if (hasNamedCollection(flatName) == false) {
            LOGGER.debug("Creating named collection for $flatName")
            createNamedCollection(
                flatName,
                replaceBucketUser(this)
            )
        }
    }

    override fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ) {
        if (hasBucket())
            delayedActionsList.changes.add {
                createBucket(this)
                ensureNamedCollection()
                createAuthorizedClickHouseUser(flatName)
                createSupersetDatabase(this)
            }
    }

    override fun postDelete(ctx: AuthzContext, delayedActionsList: DelayedActionsList) {
        if (hasBucket()) {
            delayedActionsList.changes.add {
                deleteSupersetDatabase(this)
                deleteBucketUser(this)
                deleteNamedCollection(flatName)
                deleteClickHouseUser(flatName)
                deleteBucket(this)
            }
        }
    }

    fun hasBucket() = flatName.length <= BUCKET_MAX_LENGTH && !project.endsWith("--x-s3") && bucketClient() != null
}

@Serializable
@SerialName("group")
data class UdhGroup(val tenant: String, val group: String) : UdhResourceModel, UdhPrincipal {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhGroup {
            val tenant = attributes["tenant"]!!.first()
            val group = attributes["group"]!!.first()
            return UdhGroup(tenant, group)
        }
    }

    override val path: ResourcePath
        get() = ResourcePath(listOf(TENANT_TYPE.resourceTypeName to tenant, GROUP_TYPE.resourceTypeName to group))

    override fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ) {
        val tenantHash = tenantGroupId(tenant)
        val groupGroup =
            ctx.realm.createGroup(path.toHash(), group, ctx.realm.getGroupById(tenantHash))
        val mgmtPermissions = AdminPermissions.management(ctx.session, ctx.realm)
        mgmtPermissions.groups().setPermissionsEnabled(groupGroup, true)
    }

    override fun postDelete(ctx: AuthzContext, delayedActionsList: DelayedActionsList) {
        val groupHash = path.toHash()
        ctx.realm.getGroupById(groupHash)?.let(ctx.realm::removeGroup)
        ctx.policyStore.findByName(ctx.resourceServer, groupHash)?.let { ctx.policyStore.delete(it.id) }
    }

    override fun getIdentity(ctx: AuthzContext): Identity {
        return AttributeIdentity(
            Attributes.from(mapOf("data-hub.attribute.groups" to listOf("/${tenant}/${group}")))
        )
    }
}


@Serializable
@SerialName("sensorCredential")
data class UdhSensorCredential(val tenant: String, val project: String, val sensorCredential: String) :
    UdhResourceModel,
    UdhPrincipal {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhSensorCredential {
            val tenant = attributes["tenant"]!!.first()
            val project = attributes["project"]!!.first()
            val sensorCredential = attributes["sensor-credential"]!!.first()
            return UdhSensorCredential(tenant, project, sensorCredential)
        }
    }

    override val path: ResourcePath
        get() = ResourcePath(
            listOf(
                TENANT_TYPE.resourceTypeName to tenant,
                PROJECT_TYPE.resourceTypeName to project,
                SENSOR_CREDENTIAL_TYPE.resourceTypeName to sensorCredential
            )
        )

    val projectModel: UdhProject get() = UdhProject(tenant, project)

    override fun postDelete(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList
    ) {
        val credentialHash = path.toHash()
        val clientManager = ClientManager(RealmManager(ctx.session))
        ctx.realm.clientsStream.filter { it.getAttribute("hash") == credentialHash }.forEach {
            clientManager.removeClient(it.realm, it)
        }
    }

    override fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ): Map<String, String> {
        val project = projectModel
        val clientRep = ClientRepresentation()
        clientRep.isStandardFlowEnabled = false
        clientRep.isPublicClient = false
        clientRep.isServiceAccountsEnabled = true
        clientRep.defaultClientScopes = listOf()
        clientRep.optionalClientScopes = listOf()
        clientRep.attributes = mapOf("hash" to path.toHash())

        fun createMapper(t: String, m: Map<String, String>): ProtocolMapperRepresentation {
            val mapper = ProtocolMapperRepresentation()
            mapper.name = UUID.randomUUID().toString()
            mapper.protocol = "openid-connect"
            mapper.protocolMapper = t
            mapper.config = m
            return mapper
        }

        clientRep.protocolMappers = listOf(
            createMapper(
                "oidc-hardcoded-claim-mapper", mapOf(
                    "claim.name" to "projects",
                    "claim.value" to NON_COERCING_MAPPER.writeValueAsString(
                        listOf(
                            project.flatName
                        )
                    ),
                    "jsonType.label" to "JSON",
                    "access.token.claim" to "true",
                )
            ),
            createMapper(
                "oidc-audience-mapper", mapOf(
                    "included.custom.audience" to "ingestor",
                    "access.token.claim" to "true",
                )
            )
        )
        val client = ClientManager.createClient(ctx.session, ctx.realm, clientRep)
        return mapOf(
            "username" to client.clientId,
            "password" to client.secret
        )
    }

    override fun customAction(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        action: String,
        body: String?,
        resource: UdhResource<*>
    ): Map<String, String> {
        if (action == "rotate") {
            if (!hasPermissionScopes(
                    resource.kcResource,
                    listOf("rotate"),
                    ctx,
                    ctx.evaluationContext
                )
            ) {
                throw ForbiddenException()
            }
            postDelete(ctx, delayedActionsList)
            return postCreate(ctx, delayedActionsList, resource, null)
        }
        throw NotFoundException()
    }
}

@Serializable
@SerialName("sensorSubscription")
data class UdhSensorSubscription(val tenant: String, val project: String, val sensorSubscription: String) :
    UdhResourceModel {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhSensorSubscription {
            val tenant = attributes["tenant"]!!.first()
            val project = attributes["project"]!!.first()
            val sensorSubscription = attributes["sensor-subscription"]!!.first()
            return UdhSensorSubscription(tenant, project, sensorSubscription)
        }

        const val ATTR_URI = "mqtt-uri"
        const val ATTR_TOPIC = "mqtt-topic"
        const val ATTR_FORMAT = "mqtt-format"
        const val ATTR_USERNAME = "mqtt-username"
        const val ATTR_PASSWORD = "mqtt-password"
        const val ATTR_CONNECTION_STATE = "connection-state"
        const val ATTR_CONNECTION_ERROR = "connection-error"
        const val ATTR_LAST_MESSAGE_TIMESTAMP = "last-message-timestamp"

        @Synchronized
        fun sync(ctx: AuthzContext) {
            LOGGER.info("syncing sensor subscriptions")

            val subscriptions = lookupResources(ctx, SENSOR_SUBSCRIPTION_TYPE, mapOf()).map {
                val s = it.getResourceModel()
                Subscription(
                    s.projectModel.flatName,
                    s.sensorSubscription,
                    SubscriptionConfig.fromAttributes(it.kcResource.attributes)
                )
            }.toSet()

            updateConfigSecret(subscriptions)
        }

        private fun updateConfigSecret(subscriptions: Set<Subscription>) {
            val ingestorSecretName: String = getenv("INGESTOR_SECRET")
            val ingestorSecretNamespace: String = getenv("KUBERNETES_NAMESPACE")

            val client = Config.defaultClient()
            Configuration.setDefaultApiClient(client)
            val api = CoreV1Api()

            val meta = V1ObjectMeta()
            meta.name = ingestorSecretName
            val secret =
                V1Secret().metadata(meta).putStringDataItem("subscriptions", Json.encodeToString(subscriptions))
            try {
                api.replaceNamespacedSecret(ingestorSecretName, ingestorSecretNamespace, secret).execute()
            } catch (e: ApiException) {
                if (e.code == 404) api.createNamespacedSecret(ingestorSecretNamespace, secret).execute()
                else throw e
            }
        }
    }

    override val path: ResourcePath
        get() = ResourcePath(
            listOf(
                TENANT_TYPE.resourceTypeName to tenant,
                PROJECT_TYPE.resourceTypeName to project,
                SENSOR_SUBSCRIPTION_TYPE.resourceTypeName to sensorSubscription
            )
        )

    val projectModel: UdhProject get() = UdhProject(tenant, project)

    override fun postDelete(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList
    ) {
        delayedActionsList.changes.add {
            sync(ctx)
        }
    }

    @Serializable
    data class SubscriptionConfig(
        val uri: String,
        val topic: String,
        val format: String,
        val username: String,
        val password: String
    ) {
        companion object {
            fun fromAttributes(attributes: Map<String, List<String>>): SubscriptionConfig {
                return SubscriptionConfig(
                    attributes[ATTR_URI]!![0],
                    attributes[ATTR_TOPIC]!![0],
                    attributes[ATTR_FORMAT]!![0],
                    attributes[ATTR_USERNAME]!![0],
                    attributes[ATTR_PASSWORD]!![0],
                )
            }
        }
    }

    @Serializable
    data class Subscription(val project: String, val name: String, val config: SubscriptionConfig)

    override fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ) {
        val subscriptionConfig = decodeJson<SubscriptionConfig>(body)
        resource.kcResource.setAttribute(ATTR_URI, listOf(validateAttributeValue(subscriptionConfig.uri)))
        resource.kcResource.setAttribute(ATTR_TOPIC, listOf(validateAttributeValue(subscriptionConfig.topic)))
        resource.kcResource.setAttribute(ATTR_FORMAT, listOf(validateAttributeValue(subscriptionConfig.format)))
        resource.kcResource.setAttribute(ATTR_USERNAME, listOf(validateAttributeValue(subscriptionConfig.username)))
        resource.kcResource.setAttribute(ATTR_PASSWORD, listOf(validateAttributeValue(subscriptionConfig.password)))
        delayedActionsList.setAuditLogDetails(subscriptionConfig.copy(password = "****"))
        delayedActionsList.changes.add {
            sync(ctx)
        }
    }
}

@Serializable
@SerialName("dataset")
data class UdhDataset(val tenant: String, val project: String, val dataset: String) :
    UdhResourceModel {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhDataset {
            val tenant = attributes["tenant"]!!.first()
            val project = attributes["project"]!!.first()
            val dataset = attributes["dataset"]!!.first()
            return UdhDataset(tenant, project, dataset)
        }

        const val ATTR_PATH = "dataset-path"
        const val ATTR_FORMAT = "dataset-format"
    }

    override val path: ResourcePath
        get() = ResourcePath(
            listOf(
                TENANT_TYPE.resourceTypeName to tenant,
                PROJECT_TYPE.resourceTypeName to project,
                DATASET_TYPE.resourceTypeName to dataset
            )
        )

    enum class ClickHouseFormat {
        CSV,
        JSON,
        JSONCompact,
    }

    @Serializable
    data class DatasetConfig(
        val path: String,
        val format: ClickHouseFormat,
    ) {
        companion object {
            fun fromAttributes(attributes: Map<String, List<String>>): DatasetConfig {
                return DatasetConfig(
                    attributes[ATTR_PATH]!![0],
                    ClickHouseFormat.valueOf(attributes[ATTR_FORMAT]!![0]),
                )
            }
        }
    }

    val flatName get() = "$tenant.$project.$dataset"
    val projectModel: UdhProject get() = UdhProject(tenant, project)

    override fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ) {
        val datasetConfig = decodeJson<DatasetConfig>(body)
        resource.kcResource.setAttribute(ATTR_PATH, listOf(validateAttributeValue(datasetConfig.path)))
        resource.kcResource.setAttribute(ATTR_FORMAT, listOf(validateAttributeValue(datasetConfig.format.name)))

        val pathRegex = "^[a-zA-Z0-9()+,.;:=@_/-]+$"
        if (!datasetConfig.path.matches(Regex(pathRegex)))
            throw BadRequestException("dataset path must match $pathRegex")

        delayedActionsList.setAuditLogDetails(datasetConfig)
        if (projectModel.hasBucket()) {
            prepareSupersetDataset(this, datasetConfig)
            delayedActionsList.changes.add {
                finalizeSupersetDataset(this)
            }
        }
    }

    override fun postDelete(ctx: AuthzContext, delayedActionsList: DelayedActionsList) {
        if (projectModel.hasBucket())
            delayedActionsList.changes.add {
                deleteSupersetDataset(this)
            }
    }

    override fun customAction(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        action: String,
        body: String?,
        resource: UdhResource<*>
    ): Any? {
        if (action == "refresh") {
            if (!hasPermissionScopes(
                    resource.kcResource,
                    listOf("refresh"),
                    ctx,
                    ctx.evaluationContext
                )
            ) {
                throw ForbiddenException()
            }
            if (projectModel.hasBucket())
                delayedActionsList.changes.add {
                    refreshSupersetDataset(this)
                }
            return null
        } else {
            return super.customAction(ctx, delayedActionsList, action, body, resource)
        }
    }
}

@Serializable
@SerialName("publishedQuery")
data class UdhPublishedQuery(val tenant: String, val vizGroup: String, val publishedQuery: String) :
    UdhResourceModel {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhPublishedQuery {
            val tenant = attributes["tenant"]!!.first()
            val vizGroup = attributes["viz-group"]!!.first()
            val publishedQuery = attributes["published-query"]!!.first()
            return UdhPublishedQuery(tenant, vizGroup, publishedQuery)
        }

        const val ATTR_SQL_PREFIX = "pubq-sql"
    }

    override val path: ResourcePath
        get() = ResourcePath(
            listOf(
                TENANT_TYPE.resourceTypeName to tenant,
                VIZ_GROUP_TYPE.resourceTypeName to vizGroup,
                PUBLISHED_QUERY_TYPE.resourceTypeName to publishedQuery
            )
        )

    @Serializable
    data class QueryConfig(val sql: String) {
        companion object {
            fun fromAttributes(attributes: Map<String, List<String>>): QueryConfig {
                val sql = attributes
                    .filterKeys { it.startsWith(ATTR_SQL_PREFIX) }
                    .mapValues { it.value[0] }
                    .toSortedMap() // alphanumeric sorting is fine with <= 8 attributes
                    .values.joinToString("")
                LOGGER.debug(sql)
                return QueryConfig(sql)
            }
        }
    }

    override fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ) {
        val queryConfig = decodeJson<QueryConfig>(body)

        val chunks = queryConfig.sql.chunked(255)
        if (chunks.count() > 8)
            throw BadRequestException("SQL query too long")
        chunks.withIndex().forEach {
            resource.kcResource.setAttribute("$ATTR_SQL_PREFIX-${it.index}", listOf(validateAttributeValue(it.value)))
        }

        delayedActionsList.setAuditLogDetails(queryConfig)
    }
}

fun toValidIdentifier(name: String): String? {
    var fixedName = name.lowercase().replace(Regex("[^a-z0-9-]"), "")
    if (fixedName.length > 32) {
        fixedName = fixedName.substring(0, 32)
    }
    fixedName = fixedName.trim('-')
    if (!NAME_REGEX.matches(fixedName)) {
        LOGGER.warn("invalid identifier $name is still invalid: $fixedName")
        return null
    }
    return fixedName
}

@Serializable
@SerialName("vizGroup")
data class UdhVizGroup(val tenant: String, val vizGroup: String) : UdhResourceModel, UdhPrincipal {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhVizGroup {
            val tenant = attributes["tenant"]!!.first()
            val vizGroup = attributes["viz-group"]!!.first()
            return UdhVizGroup(tenant, vizGroup)
        }
    }

    @Serializable
    data class CreateDashboardBody(val title: String)

    override fun customAction(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        action: String,
        body: String?,
        resource: UdhResource<*>
    ): Any? {
        if (action == "create-dashboard") {
            if (!hasPermissionScopes(resource.kcResource, listOf("dashboard:admin"), ctx, ctx.evaluationContext)) {
                throw ForbiddenException()
            }

            val createDashboardBody = decodeJson<CreateDashboardBody>(body ?: throw BadRequestException())
            val title = createDashboardBody.title
            val dashboardName = toValidIdentifier(title) ?: throw BadRequestException()
            val dashboard = UdhDashboard(tenant, vizGroup, dashboardName)
            createResource(ctx, path, DASHBOARD_TYPE.resourceTypeName, dashboardName)
            delayedActionsList.setAuditLogDetails(createDashboardBody)
            delayedActionsList.changes.add {
                createSupersetDashboardWithTitle(dashboard.dashboardSlug, title)
            }
            return mapOf(
                "slug" to dashboard.dashboardSlug,
                "dashboardName" to dashboardName,
            )
        }
        return super.customAction(ctx, delayedActionsList, action, body, resource)
    }

    override val path: ResourcePath
        get() = ResourcePath(
            listOf(
                TENANT_TYPE.resourceTypeName to tenant,
                VIZ_GROUP_TYPE.resourceTypeName to vizGroup
            )
        )
}

@Serializable
@SerialName("dashboard")
data class UdhDashboard(val tenant: String, val vizGroup: String, val dashboard: String) : UdhResourceModel,
    UdhPrincipal {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhDashboard {
            val tenant = attributes["tenant"]!!.first()
            val vizGroup = attributes["viz-group"]!!.first()
            val dashboard = attributes["dashboard"]!!.first()
            return UdhDashboard(tenant, vizGroup, dashboard)
        }
    }

    override val path: ResourcePath
        get() = ResourcePath(
            listOf(
                TENANT_TYPE.resourceTypeName to tenant,
                VIZ_GROUP_TYPE.resourceTypeName to vizGroup,
                DASHBOARD_TYPE.resourceTypeName to dashboard
            )
        )


    override fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ) {
        delayedActionsList.changes.add {
            createSupersetDashboard(this)
        }
    }

    override fun postDelete(ctx: AuthzContext, delayedActionsList: DelayedActionsList) {
        delayedActionsList.changes.add {
            deleteSupersetDashboard(this)
        }
    }

    val dashboardSlug get() = "${tenant}_${vizGroup}_${dashboard}"
}

fun enforceMaxLength(input: String, maxLength: Int): String {
    return if (input.length > maxLength) {
        input.substring(0, maxLength)
    } else {
        input
    }
}

@Serializable
data class ContainerStatus(
    val running: Boolean,
    val waiting: Boolean,
    val ready: Boolean,
    val waitingReason: String?,
    val waitingMessage: String?,
    val restartCount: Int?,
)


fun commonGetContainerStatus(namespace: String, labelSelector: String): ContainerStatus? {
    val core = CoreV1Api(Config.defaultClient())
    val pod = core.listNamespacedPod(namespace)
        .labelSelector(labelSelector).execute()?.items?.firstOrNull() ?: return null

    val containerStatus = pod.status?.containerStatuses?.firstOrNull() ?: return null
    return ContainerStatus(
        running = containerStatus.state?.running != null,
        waiting = containerStatus.state?.waiting != null,
        ready = containerStatus.ready == true,
        waitingReason = containerStatus.state?.waiting?.reason,
        waitingMessage = containerStatus.state?.waiting?.message,
        restartCount = containerStatus.restartCount,
    )
}

fun commonReadContainerLogs(namespace: String, labelSelector: String, lines: Int): String? {
    val core = CoreV1Api(Config.defaultClient())
    val pod = core.listNamespacedPod(namespace)
        .labelSelector(labelSelector).execute()?.items?.firstOrNull() ?: return null
    try {
        return core.readNamespacedPodLog(pod.metadata.name, pod.metadata.namespace).tailLines(lines).execute()
    } catch (e: ApiException) {
        // this can fail when the pod fails to start, return null in that case
        e.printStackTrace()
        return null
    }
}

@Serializable
@SerialName("shared-app")
data class UdhSharedApp(val tenant: String, val sharedApp: String) : UdhResourceModel {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhSharedApp {
            val tenant = attributes["tenant"]!!.first()
            val sharedApp = attributes["shared-app"]!!.first()
            return UdhSharedApp(tenant, sharedApp)
        }

        const val ATTR_REGISTRY_HOST = "shared-app-registry-host"
        const val ATTR_REGISTRY_USERNAME = "shared-app-registry-username"
        const val ATTR_REGISTRY_PASSWORD = "shared-app-registry-password"
        const val ATTR_IMAGE_PATH = "shared-app-image-path"
        const val ATTR_IMAGE_DIGEST = "shared-app-image-digest"
        const val ATTR_DISPLAY_NAME = "shared-app-display-name"
        const val ATTR_DESCRIPTION = "shared-app-description"
        const val ATTR_ADMIN_CONTACT = "shared-app-admin-contact"
        const val ATTR_PICTURE_URI = "shared-app-picture-uri"
        const val ATTR_CATEGORIES = "shared-app-categories"

        val GSON = GsonBuilder().setPrettyPrinting().create()

        @Synchronized
        fun syncPostgres(ctx: AuthzContext) {
            val postgres: String = getenv("SHARED_APPS_POSTGRES")
            val databaseNames = lookupResources(ctx, SHARED_APP_TYPE, emptyMap()).map {
                it.getResourceModel().internalName
            }.sorted()
            val databases = databaseNames.associateWith { it }
            val roles = databaseNames.map {
                mapOf(
                    "login" to true,
                    "name" to it,
                    "passwordSecret" to mapOf(
                        "exists" to false,
                        "name" to "$postgres-$it"
                    )
                )
            }

            val helmClient = getDynamicHelmClient()

            val postgresHelmReleaseObject = helmClient.get(sharedAppsNamespace, postgres).`object`
            val values = postgresHelmReleaseObject.raw.getAsJsonObject("spec").getAsJsonObject("values")
            values.add("databases", GSON.toJsonTree(databases))
            values.add("roles", GSON.toJsonTree(roles))
            LOGGER.debug(GSON.toJson(postgresHelmReleaseObject))
            helmClient.update(postgresHelmReleaseObject).throwsApiException()
        }

        fun getDynamicHelmClient(): DynamicKubernetesApi {
            return DynamicKubernetesApi(
                "helm.toolkit.fluxcd.io",
                "v2",
                "helmreleases",
                Config.defaultClient()
            )
        }

        val sharedAppsNamespace get() = getenv("SHARED_APPS_NAMESPACE")
    }

    @Serializable
    data class SharedAppConfig(
        val imageRegistry: String,
        val registryUsername: String?,
        val registryPassword: String?,
        val imageRepository: String,
        val imageDigest: String,
        val displayName: String,
        val description: String,
        val adminContact: String,
        val pictureUri: String?,
        val categories: List<CitytoolCategory> = emptyList(),
    ) {
        companion object {
            fun fromAttributes(attributes: Map<String, List<String>>): SharedAppConfig {
                return SharedAppConfig(
                    imageRegistry = attributes[ATTR_REGISTRY_HOST]!![0],
                    registryUsername = attributes[ATTR_REGISTRY_USERNAME]?.firstOrNull(),
                    registryPassword = attributes[ATTR_REGISTRY_PASSWORD]?.firstOrNull(),
                    imageRepository = attributes[ATTR_IMAGE_PATH]!![0],
                    imageDigest = attributes[ATTR_IMAGE_DIGEST]!![0],
                    displayName = attributes[ATTR_DISPLAY_NAME]!![0],
                    description = attributes[ATTR_DESCRIPTION]!![0],
                    adminContact = attributes[ATTR_ADMIN_CONTACT]!![0],
                    pictureUri = attributes[ATTR_PICTURE_URI]?.firstOrNull(),
                    categories = attributes[ATTR_CATEGORIES]?.firstOrNull()?.let {
                        try {
                            decodeJson(it)
                        } catch (e: BadRequestException) {
                            LOGGER.error("could not deserialize shared app categories: $it", e)
                            emptyList()
                        }
                    } ?: emptyList(),
                )
            }

            val SHA_RE = Regex("^sha256:[0-9a-f]{64}$")
        }

        fun ensureConsistency() {
            if (!SHA_RE.matches(imageDigest)) {
                throw BadRequestException("invalid image digest")
            }
            if ((registryUsername == null) != (registryPassword == null)) {
                throw BadRequestException("both username and password have to be set or not")
            }
        }
    }

    @Serializable
    data class UpdateSharedAppConfig(
        val imageRegistry: String? = null,
        val registryUsername: String? = null,
        val registryPassword: String? = null,
        val imageRepository: String? = null,
        val imageDigest: String? = null,
        val displayName: String? = null,
        val description: String? = null,
        val adminContact: String? = null,
        val pictureUri: String? = null,
        val categories: List<CitytoolCategory>? = null,
    )

    override val path: ResourcePath
        get() = ResourcePath(
            listOf(
                TENANT_TYPE.resourceTypeName to tenant,
                SHARED_APP_TYPE.resourceTypeName to sharedApp
            )
        )

    val clientId get() = "${tenant}.${sharedApp}"
    val internalName get() = enforceMaxLength("$tenant-$sharedApp", (62 - 7)) + "-" + path.toHash().slice(0..6)
    val sharedAppHost get() = "$sharedApp.$tenant.${getenv("SHARED_APPS_BASE_DOMAIN")}"

    private fun createClient(ctx: AuthzContext, displayName: String) {
        val clientRep = ClientRepresentation()
        clientRep.clientId = clientId
        clientRep.name = displayName
        clientRep.isStandardFlowEnabled = true
        clientRep.isDirectAccessGrantsEnabled = false
        clientRep.isPublicClient = true
        clientRep.isServiceAccountsEnabled = false
        clientRep.defaultClientScopes = listOf("profile", "email")
        clientRep.optionalClientScopes = listOf("data-hub", "buckets")
        clientRep.redirectUris = listOf(
            "https://${sharedAppHost}/*"
        )
        clientRep.attributes = mapOf("shared-app-client" to "true")
        val citytoolsMapper = ProtocolMapperRepresentation()
        citytoolsMapper.name = "udh-citytool"
        citytoolsMapper.protocol = "openid-connect"
        citytoolsMapper.protocolMapper = "udh-citytool"
        citytoolsMapper.config = mapOf(
            "userinfo.token.claim" to "true",
            "id.token.claim" to "true",
            "access.token.claim" to "true"
        )
        clientRep.protocolMappers = listOf(citytoolsMapper)
        clientRep.webOrigins = listOf("+")

        ClientManager.createClient(ctx.session, ctx.realm, clientRep)
    }

    private fun deleteClient(ctx: AuthzContext) {
        val clientManager = ClientManager(RealmManager(ctx.session))
        ctx.realm.getClientByClientId(clientId)?.let {
            clientManager.removeClient(it.realm, it)
        }
    }

    fun toHelmValues(config: SharedAppConfig): Map<*, *> {
        val keycloakHost = getenv("KEYCLOAK_HOSTNAME")
        val keycloakIssuer = "${keycloakHost}realms/udh"
        val certIssuer = getenv("APPS_CERT_ISSUER")
        val postgres = getenv("SHARED_APPS_POSTGRES")
        return mapOf(
            "image" to mapOf(
                "registry" to config.imageRegistry,
                "repository" to config.imageRepository,
                "digest" to config.imageDigest,
            ),
            "registryAuth" to mapOf(
                "username" to config.registryUsername,
                "password" to config.registryPassword,
            ),
            "host" to sharedAppHost,
            "certIssuer" to certIssuer,
            "postgres" to mapOf(
                "host" to "$postgres-rw",
                "secret" to "$postgres-$internalName",
                "database" to internalName,
                "networkPolicy" to mapOf(
                    "matchLabels" to mapOf(
                        "cnpg.io/cluster" to postgres
                    )
                )
            ),
            "keycloakIssuer" to keycloakIssuer,
            "keycloakClientId" to clientId,
            "tenant" to tenant,
            "citytool" to sharedApp,
            "contact" to config.adminContact,
        )
    }

    fun toHelmRelease(config: SharedAppConfig): DynamicKubernetesObject {
        val sharedAppsHelmRepo: String = getenv("SHARED_APPS_HELM_REPO")

        val hr = DynamicKubernetesObject(
            GSON.toJsonTree(
                mapOf(
                    "spec" to mapOf(
                        "releaseName" to internalName,
                        "interval" to "1h",
                        "timeout" to "3m",
                        "chart" to mapOf(
                            "spec" to mapOf(
                                "chart" to "urbanstack-shared-app",
                                "version" to "1.0.x",
                                "interval" to "1h",
                                "sourceRef" to mapOf(
                                    "name" to sharedAppsHelmRepo,
                                    "kind" to "HelmRepository"
                                )
                            )
                        ),
                        "values" to toHelmValues(config),
                    )
                )
            ) as JsonObject
        )

        hr.kind = "HelmRelease"
        hr.apiVersion = "helm.toolkit.fluxcd.io/v2"
        hr.metadata = V1ObjectMeta().name(internalName).namespace(sharedAppsNamespace)
        return hr
    }

    fun createUpdateHelmRelease(config: SharedAppConfig) {
        val hrApi = getDynamicHelmClient()

        val helmRelease = toHelmRelease(config)
        val resp = hrApi.create(helmRelease)
        if (resp.httpStatusCode == 409) {
            val oldHr = hrApi.get(sharedAppsNamespace, internalName).throwsApiException().`object`
            oldHr.raw.getAsJsonObject("spec").add("values", GSON.toJsonTree(toHelmValues(config)))
            hrApi.update(oldHr).throwsApiException()
        } else if (resp.httpStatusCode >= 400) {
            resp.throwsApiException()
        }
    }

    fun deleteHelmRelease() {
        val hrApi = getDynamicHelmClient()
        // don't raise an exception, most likely the HelmRelease was already deleted
        hrApi.delete(sharedAppsNamespace, internalName)
    }

    fun getContainerStatus(): ContainerStatus? {
        return commonGetContainerStatus(sharedAppsNamespace, "app.kubernetes.io/instance=$internalName")
    }

    fun readContainerLogs(lines: Int): String? {
        return commonReadContainerLogs(sharedAppsNamespace, "app.kubernetes.io/instance=$internalName", lines)
    }

    fun setCategories(res: Resource, categories: List<CitytoolCategory>) {
        res.setAttribute(ATTR_CATEGORIES, listOf(JSON.serialize(
            categories.toSet().sorted()
        )))
    }

    override fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ) {
        val config = decodeJson<SharedAppConfig>(body)

        config.ensureConsistency()

        delayedActionsList.setAuditLogDetails(config.copy(registryPassword = config.registryPassword?.let { "****" }))

        resource.kcResource.setAttribute(ATTR_REGISTRY_HOST, listOf(config.imageRegistry))
        resource.kcResource.setAttribute(ATTR_REGISTRY_USERNAME, listOf(config.registryUsername))
        resource.kcResource.setAttribute(ATTR_REGISTRY_PASSWORD, listOf(config.registryPassword))
        resource.kcResource.setAttribute(ATTR_IMAGE_PATH, listOf(config.imageRepository))
        resource.kcResource.setAttribute(ATTR_IMAGE_DIGEST, listOf(config.imageDigest))
        resource.kcResource.setAttribute(ATTR_DISPLAY_NAME, listOf(config.displayName))
        resource.kcResource.setAttribute(ATTR_DESCRIPTION, listOf(config.description))
        resource.kcResource.setAttribute(ATTR_ADMIN_CONTACT, listOf(config.adminContact))
        resource.kcResource.setAttribute(ATTR_PICTURE_URI, listOf(config.pictureUri))
        setCategories(resource.kcResource, config.categories)

        delayedActionsList.changes.add {
            syncPostgres(ctx)
        }
        createUpdateForConfig(ctx, delayedActionsList, config)
    }

    fun createUpdateForConfig(ctx: AuthzContext, delayedActionsList: DelayedActionsList, config: SharedAppConfig) {
        // only create client if it doesn't exist
        val existingClient = ctx.realm.getClientByClientId(clientId)
        if (existingClient != null) {
            existingClient.name = config.displayName
        } else {
            createClient(ctx, config.displayName)
        }

        // handle kubernetes stuff
        delayedActionsList.changes.add {
            createUpdateHelmRelease(config)
        }
    }

    override fun customAction(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        action: String,
        body: String?,
        resource: UdhResource<*>
    ): Any? {
        if (action == "update") {
            val kcResource = resource.kcResource
            if (!hasPermissionScopes(kcResource, listOf(ADMIN_SCOPE), ctx, ctx.evaluationContext)) {
                throw ForbiddenException()
            }
            val configUpdate = decodeJson<UpdateSharedAppConfig>(body)
            val oldConfig = SharedAppConfig.fromAttributes(kcResource.attributes)
            // if host, path or username changed, password needs to be set as well
            val hostChanged =
                configUpdate.imageRegistry != null && configUpdate.imageRegistry != oldConfig.imageRegistry
            val pathChanged =
                configUpdate.imageRepository != null && configUpdate.imageRepository != oldConfig.imageRepository
            val usernameChanged =
                configUpdate.registryUsername != null && configUpdate.registryUsername != oldConfig.registryUsername
            if ((hostChanged || pathChanged || usernameChanged) && configUpdate.registryPassword == null && oldConfig.registryPassword != null) {
                throw BadRequestException("password needs to be given when updating imageRegistry, imageRepository or registryUsername")
            }
            configUpdate.imageRegistry?.let {
                kcResource.setAttribute(ATTR_REGISTRY_HOST, listOf(it))
            }
            configUpdate.registryUsername?.let {
                kcResource.setAttribute(ATTR_REGISTRY_USERNAME, listOf(it))
            }
            configUpdate.registryPassword?.let {
                kcResource.setAttribute(ATTR_REGISTRY_PASSWORD, listOf(it))
            }
            configUpdate.imageRepository?.let {
                kcResource.setAttribute(ATTR_IMAGE_PATH, listOf(it))
            }
            configUpdate.imageDigest?.let {
                kcResource.setAttribute(ATTR_IMAGE_DIGEST, listOf(it))
            }
            configUpdate.displayName?.let {
                kcResource.setAttribute(ATTR_DISPLAY_NAME, listOf(it))
            }
            configUpdate.description?.let {
                kcResource.setAttribute(ATTR_DESCRIPTION, listOf(it))
            }
            configUpdate.adminContact?.let {
                kcResource.setAttribute(ATTR_ADMIN_CONTACT, listOf(it))
            }
            configUpdate.pictureUri?.let {
                if (it == "") {
                    kcResource.removeAttribute(ATTR_PICTURE_URI)
                } else {
                    kcResource.setAttribute(ATTR_PICTURE_URI, listOf(it))
                }
            }
            configUpdate.categories?.let {
                setCategories(kcResource, it)
            }

            val newConfig = SharedAppConfig.fromAttributes(kcResource.attributes)

            // sanity check, should always succeed
            newConfig.ensureConsistency()

            delayedActionsList.setAuditLogDetails(newConfig.copy(registryPassword = configUpdate.registryPassword?.let { "****" }))

            createUpdateForConfig(ctx, delayedActionsList, newConfig)

            return Response.noContent().build()
        }
        return super.customAction(ctx, delayedActionsList, action, body, resource)
    }

    override fun postDelete(ctx: AuthzContext, delayedActionsList: DelayedActionsList) {
        deleteClient(ctx)

        delayedActionsList.changes.add {
            syncPostgres(ctx)
            deleteHelmRelease()
        }
    }
}

@Serializable
data class CitytoolMeta(
    val showInCitizenhub: Boolean,
    val showInGovhub: Boolean,
    val name: String,
    val description: String,
    val pictureUri: String? = null,
    val indexPath: String? = null,
    val categories: List<CitytoolCategory> = emptyList()
)

@Serializable
enum class CitytoolCategory {
    @GraphQLDescription("Office")
    OFFICE,
    @GraphQLDescription("Fachverfahren")
    SPECIALIZED_APPLICATION,
    @GraphQLDescription("Datenanalyse")
    DATA_ANALYTICS,
    @GraphQLDescription("Bürgerservices")
    CITIZEN_SERVICES,
    @GraphQLDescription("Geoinformation")
    GEO_INFORMATION,
    @GraphQLDescription("Intelligente Automation")
    INTELLIGENT_AUTOMATION,
    @GraphQLDescription("Apps & Tools")
    APPS_TOOLS,
}

@Serializable
@SerialName("citytool")
data class UdhCitytool(val tenant: String, val citytool: String) : UdhResourceModel, UdhPrincipal {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhCitytool {
            val tenant = attributes["tenant"]!!.first()
            val citytool = attributes["citytool"]!!.first()
            return UdhCitytool(tenant, citytool)
        }

        const val ATTR_STARS = "citytool-stars"
        const val ATTR_PATH = "citytool-path"

        private var CITYTOOLS_META: Map<String, CitytoolMeta> = emptyMap()

        @OptIn(ExperimentalSerializationApi::class)
        @Synchronized
        fun getAllMeta(): Map<String, CitytoolMeta> {
            if (CITYTOOLS_META.isEmpty()) {
                CITYTOOLS_META = UdhCitytool::class.java.classLoader.getResourceAsStream("citytools.json")!!
                    .use(Json::decodeFromStream)
            }
            return CITYTOOLS_META
        }

        @Synchronized
        fun sync(ctx: AuthzContext) {
            LOGGER.info("syncing citytools")

            val bucketServiceName = getenv("BUCKET_SERVICE_ENDPOINT") ?: return
            val citytoolsIngressName = getenv("CITYTOOLS_INGRESS")
            val citytoolsServiceName = getenv("CITYTOOLS_SERVICE_ENDPOINT")
            // based on https://web.archive.org/web/20190312223224/http://linuxplayer.org/2013/06/nginx-try-files-on-multiple-named-location-or-server
            val citytoolsAnnotation = lookupResources(ctx, CITYTOOL_TYPE, emptyMap()).joinToString("") {
                val model = it.getResourceModel()
                val path = getPathAttribute(it)
                "location ~ ^/?(${model.tenant})/($path)/(.*) {" +
                        if (model.citytool != path) {
                            "set \$tool ${model.citytool};"
                        } else {
                            ""
                        } +
                        "try_files /dev/null @citytools-overwrite;}\n"
            } + """
            location @citytools-overwrite {
              set_if_empty ${'$'}tool ${'$'}2;
              proxy_pass $bucketServiceName/ct.${'$'}1.${'$'}tool/${'$'}3;
              proxy_intercept_errors on;
              recursive_error_pages on;
              error_page 404 = @citytools-base;
              error_page 403 = @citytools-base;
            }

            location @citytools-base {
              proxy_pass $citytoolsServiceName/${'$'}tool/${'$'}3;
            }
            """.trimIndent()
            LOGGER.debug(citytoolsAnnotation)
            val kubernetesNamespace: String = getenv("KUBERNETES_NAMESPACE")

            val client = Config.defaultClient()
            Configuration.setDefaultApiClient(client)
            val api = NetworkingV1Api()

            val citytoolsIngress = api.readNamespacedIngress(citytoolsIngressName, kubernetesNamespace).execute()
            citytoolsIngress.metadata.putAnnotationsItem(
                "nginx.ingress.kubernetes.io/server-snippet",
                citytoolsAnnotation
            )
            api.replaceNamespacedIngress(citytoolsIngressName, kubernetesNamespace, citytoolsIngress).execute()
        }

        fun getStarsAttribute(res: UdhResource<*>): Int? {
            return res.kcResource.attributes[ATTR_STARS]?.first()?.let(String::toInt)
        }

        fun getPathAttribute(res: UdhResource<*>): String {
            return res.kcResource.attributes[ATTR_PATH]!!.first()
        }
    }

    fun getMeta(): CitytoolMeta {
        return getAllMeta()[citytool]!!
    }

    @Serializable
    data class CitytoolConfig(
        val path: String
    )

    // check if another citytool in this tenant already uses the path
    fun ensurePathValid(ctx: AuthzContext, path: String) {
        ensureValidName(path)
        if (lookupResources(ctx, CITYTOOL_TYPE, mapOf(TENANT_TYPE.resourceTypeName to tenant))
                .any { it.getResourceModel().citytool != citytool && getPathAttribute(it) == path }
        ) {
            throw ClientErrorException("path $path is already used", Response.Status.CONFLICT)
        }
    }

    override fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ): Any? {
        if (!getAllMeta().containsKey(citytool)) {
            throw BadRequestException("citytool $citytool doesn't exist")
        }

        val pathBody = decodeJson<CitytoolConfig>(body)
        ensurePathValid(ctx, pathBody.path)
        resource.kcResource.setAttribute(ATTR_PATH, listOf(pathBody.path))
        delayedActionsList.setAuditLogDetails(pathBody)
        delayedActionsList.changes.add {
            createBucketForCitytool(this)
            sync(ctx)
        }
        return null
    }

    override fun customAction(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        action: String,
        body: String?,
        resource: UdhResource<*>
    ): Any? {
        when (action) {
            "update-path" -> {
                if (!hasPermissionScopes(resource.kcResource, listOf(ADMIN_SCOPE), ctx, ctx.evaluationContext)) {
                    throw ForbiddenException()
                }

                val citytoolConfig = decodeJson<CitytoolConfig>(body)
                ensurePathValid(ctx, citytoolConfig.path)
                resource.kcResource.setAttribute(ATTR_PATH, listOf(citytoolConfig.path))

                delayedActionsList.setAuditLogDetails(citytoolConfig)
                delayedActionsList.changes.add {
                    sync(ctx)
                }

                return Response.noContent().build()

            }

            "update-stars" -> {
                if (!hasPermissionScopes(resource.kcResource, listOf(ADMIN_SCOPE), ctx, ctx.evaluationContext)) {
                    throw ForbiddenException()
                }

                val stars = decodeJson<Int?>(body)
                if (stars == null) {
                    resource.kcResource.removeAttribute(ATTR_STARS)
                } else {
                    if (stars !in (0..5)) {
                        throw BadRequestException("Invalid number of stars, needs to be between 0 and 5 (inclusive)")
                    }
                    resource.kcResource.setAttribute(ATTR_STARS, listOf(stars.toString()))
                }
                delayedActionsList.setAuditLogDetails(stars)

                return Response.noContent().build()
            }
        }
        return super.customAction(ctx, delayedActionsList, action, body, resource)
    }

    override fun postDelete(ctx: AuthzContext, delayedActionsList: DelayedActionsList): Any? {
        delayedActionsList.changes.add {
            sync(ctx)
            deleteBucketForCitytool(this)
        }
        return null
    }

    val bucketName: String get() = "ct.$tenant.$citytool"

    override val path: ResourcePath
        get() = ResourcePath(
            listOf(
                TENANT_TYPE.resourceTypeName to tenant,
                CITYTOOL_TYPE.resourceTypeName to citytool
            )
        )
}

@Serializable
data class ProtocolMapperEntry(
    val protocolMapper: String,
    val config: Map<String, String>,
)

@Serializable
data class DedicatedAppMeta(
    val name: String,
    val description: String,
    val pictureUri: String? = null,
    val indexPath: String? = null,
    val protocolMappers: List<ProtocolMapperEntry> = emptyList(),
    val categories: List<CitytoolCategory> = emptyList()
)

@Serializable
@SerialName("dedicatedApp")
data class UdhDedicatedApp(val tenant: String, val dedicatedApp: String) : UdhResourceModel {
    companion object {
        fun fromAttributes(attributes: Map<String, List<String>>): UdhDedicatedApp {
            val tenant = attributes["tenant"]!!.first()
            val dedicatedApp = attributes["dedicated-app"]!!.first()
            return UdhDedicatedApp(tenant, dedicatedApp)
        }

        private var DEDICATED_APPS_META: Map<String, DedicatedAppMeta> = emptyMap()

        @OptIn(ExperimentalSerializationApi::class)
        @Synchronized
        fun getAllMeta(): Map<String, DedicatedAppMeta> {
            if (DEDICATED_APPS_META.isEmpty()) {
                DEDICATED_APPS_META = UdhCitytool::class.java.classLoader.getResourceAsStream("dedicatedApps.json")!!
                    .use(Json::decodeFromStream)
            }
            return DEDICATED_APPS_META
        }

        val GSON = GsonBuilder().setPrettyPrinting().create()

        @Synchronized
        fun syncPostgres(ctx: AuthzContext) {
            val postgres: String = getenv("DEDICATED_APPS_POSTGRES")
            val databaseNames = lookupResources(ctx, DEDICATED_APP_TYPE, emptyMap()).map {
                it.getResourceModel().internalName
            }.sorted()
            val databases = databaseNames.associateWith { it }
            val roles = databaseNames.map {
                mapOf(
                    "login" to true,
                    "name" to it,
                    "passwordSecret" to mapOf(
                        "exists" to false,
                        "name" to "$postgres-$it"
                    )
                )
            }

            val helmClient = getDynamicHelmClient()

            val postgresHelmReleaseObject = helmClient.get(dedicatedAppsNamespace, postgres).`object`
            val values = postgresHelmReleaseObject.raw.getAsJsonObject("spec").getAsJsonObject("values")
            values.add("databases", GSON.toJsonTree(databases))
            values.add("roles", GSON.toJsonTree(roles))
            LOGGER.debug(GSON.toJson(postgresHelmReleaseObject))
            helmClient.update(postgresHelmReleaseObject).throwsApiException()
        }

        val dedicatedAppsNamespace get() = getenv("DEDICATED_APPS_NAMESPACE")
    }

    fun getMeta(): DedicatedAppMeta {
        return getAllMeta()[dedicatedApp]!!
    }

    // we deliberately choose a different naming scheme from sharedApps here
    // since a malicious user can't control the dedicatedApp names, this is fine
    val clientId get() = "${dedicatedApp}-${tenant}"
    // note: needs to be below 62 characters, tenants can have up to 32 characters
    val internalName get() = "$dedicatedApp-$tenant"
    val dedicatedAppHost get() = "$dedicatedApp-$tenant.${getenv("DEDICATED_APPS_BASE_DOMAIN")}"

    private fun createClient(ctx: AuthzContext, meta: DedicatedAppMeta): String {
        val clientRep = ClientRepresentation()
        clientRep.clientId = clientId
        clientRep.name = meta.name
        clientRep.isStandardFlowEnabled = true
        clientRep.isDirectAccessGrantsEnabled = false
        clientRep.isPublicClient = false
        clientRep.isServiceAccountsEnabled = false
        clientRep.defaultClientScopes = listOf("profile", "email")
        clientRep.optionalClientScopes = listOf()
        clientRep.redirectUris = listOf(
            "https://${dedicatedAppHost}"
        )
        clientRep.attributes = mapOf(
            "dedicated-app-client" to "true",
            TENANT_TYPE.resourceTypeName to tenant,
            DEDICATED_APP_TYPE.resourceTypeName to dedicatedApp
        )
        val dedicatedAppAuthFlowId = ctx.realm.authenticationFlowsStream.filter { it.alias == "dedicated-app" }.findFirst().get().id
        clientRep.authenticationFlowBindingOverrides = mapOf("browser" to dedicatedAppAuthFlowId)
        clientRep.protocolMappers = meta.protocolMappers.map {
            val mapper = ProtocolMapperRepresentation()
            mapper.name = it.protocolMapper
            mapper.protocol = "openid-connect"
            mapper.protocolMapper = it.protocolMapper
            mapper.config = it.config
            mapper
        }
        clientRep.webOrigins = listOf("+")

        val client = ClientManager.createClient(ctx.session, ctx.realm, clientRep)
        return client.secret
    }

    private fun deleteClient(ctx: AuthzContext) {
        val clientManager = ClientManager(RealmManager(ctx.session))
        ctx.realm.getClientByClientId(clientId)?.let {
            clientManager.removeClient(it.realm, it)
        }
    }

    fun toHelmValues(clientSecret: String): Map<*, *> {
        val keycloakHost = getenv("KEYCLOAK_HOSTNAME")
        val keycloakIssuer = "${keycloakHost}realms/udh"
        val certIssuer = getenv("APPS_CERT_ISSUER")
        val postgres = getenv("DEDICATED_APPS_POSTGRES")
        val dedicatedAppsBasePullSecret: String = getenv("DEDICATED_APPS_BASE_PULL_SECRET")
        return mapOf(
            "host" to dedicatedAppHost,
            "certIssuer" to certIssuer,
            "postgres" to mapOf(
                "host" to "$postgres-rw",
                "secret" to "$postgres-$internalName",
                "database" to internalName,
                "networkPolicy" to mapOf(
                    "matchLabels" to mapOf(
                        "cnpg.io/cluster" to postgres
                    )
                )
            ),
            "imagePullSecrets" to listOf(
                mapOf(
                    "name" to "$dedicatedAppsBasePullSecret-$dedicatedApp"
                )
            ),
            "keycloakIssuer" to keycloakIssuer,
            "keycloakClientId" to clientId,
            "keycloakClientSecret" to clientSecret,
            "tenant" to tenant,
        )
    }

    fun toHelmRelease(clientSecret: String): DynamicKubernetesObject {
        val dedicatedAppsBaseHelmRepo: String = getenv("DEDICATED_APPS_BASE_HELM_REPO")

        val hr = DynamicKubernetesObject(
            GSON.toJsonTree(
                mapOf(
                    "spec" to mapOf(
                        "releaseName" to internalName,
                        "interval" to "1h",
                        "timeout" to "3m",
                        "chartRef" to mapOf(
                            "name" to "$dedicatedAppsBaseHelmRepo-$dedicatedApp",
                            "kind" to "OCIRepository"
                        ),
                        "values" to toHelmValues(clientSecret),
                    )
                )
            ) as JsonObject
        )

        hr.kind = "HelmRelease"
        hr.apiVersion = "helm.toolkit.fluxcd.io/v2"
        hr.metadata = V1ObjectMeta().name(internalName).namespace(dedicatedAppsNamespace)
        return hr
    }

    fun createUpdateHelmRelease(clientSecret: String) {
        val hrApi = getDynamicHelmClient()

        val helmRelease = toHelmRelease(clientSecret)
        val resp = hrApi.create(helmRelease)
        if (resp.httpStatusCode == 409) {
            val oldHr = hrApi.get(dedicatedAppsNamespace, internalName).throwsApiException().`object`
            oldHr.raw.getAsJsonObject("spec").add("values", UdhSharedApp.Companion.GSON.toJsonTree(toHelmValues(clientSecret)))
            hrApi.update(oldHr).throwsApiException()
        } else if (resp.httpStatusCode >= 400) {
            resp.throwsApiException()
        }
    }

    fun deleteHelmRelease() {
        val hrApi = getDynamicHelmClient()
        // don't raise an exception, most likely the HelmRelease was already deleted
        hrApi.delete(dedicatedAppsNamespace, internalName)
    }

    fun getContainerStatus(): ContainerStatus? {
        return commonGetContainerStatus(dedicatedAppsNamespace, "app.kubernetes.io/instance=$internalName")
    }

    fun readContainerLogs(lines: Int): String? {
        return commonReadContainerLogs(dedicatedAppsNamespace, "app.kubernetes.io/instance=$internalName", lines)
    }

    fun createUpdate(ctx: AuthzContext, delayedActionsList: DelayedActionsList) {
        // only create client if it doesn't exist
        val existingClient = ctx.realm.getClientByClientId(clientId)
        val clientSecret = if (existingClient != null) {
            existingClient.secret
        } else {
            createClient(ctx, getAllMeta()[dedicatedApp]!!)
        }

        // handle kubernetes stuff
        delayedActionsList.changes.add {
            createUpdateHelmRelease(clientSecret)
        }
    }

    override fun postCreate(
        ctx: AuthzContext,
        delayedActionsList: DelayedActionsList,
        resource: UdhResource<*>,
        body: String?
    ): Any? {
        val meta = getAllMeta()[dedicatedApp] ?: throw BadRequestException("dedicated app $dedicatedApp doesn't exist")

        val adminGroupName = "$dedicatedApp-admin"

        // add admin group
        ignoreConflicts { executeAction(UdhTenant(tenant).path, Action.Create(GROUP_TYPE.resourceTypeName, adminGroupName), ctx, delayedActionsList, null) }
        // add admin permission
        executeAction(
            path,
            Action.CreatePermission("admin", listOf("${DEDICATED_APP_TYPE.resourceTypeName}:$ADMIN_SCOPE"), listOf(UdhGroup(tenant, adminGroupName)), false),
            ctx,
            delayedActionsList, null
        )

        val clientSecret = createClient(ctx, meta)

        delayedActionsList.changes.add {
            syncPostgres(ctx)
            createUpdateHelmRelease(clientSecret)
        }
        return null
    }

    override fun postDelete(ctx: AuthzContext, delayedActionsList: DelayedActionsList): Any? {
        deleteClient(ctx)

        val adminGroupName = "$dedicatedApp-admin"

        // remove admin group
        ignoreConflicts { executeAction(UdhTenant(tenant).path, Action.Delete(GROUP_TYPE.resourceTypeName, adminGroupName), ctx, delayedActionsList, null) }

        delayedActionsList.changes.add {
            syncPostgres(ctx)
            deleteHelmRelease()
        }
        return null
    }

    override val path: ResourcePath
        get() = ResourcePath(
            listOf(
                TENANT_TYPE.resourceTypeName to tenant,
                DEDICATED_APP_TYPE.resourceTypeName to dedicatedApp
            )
        )
}

fun udhResourceModelFromResource(resource: Resource): UdhResourceModel {
    return when (resource.type) {
        "tenant" -> UdhTenant.fromAttributes(resource.attributes)
        "project" -> UdhProject.fromAttributes(resource.attributes)
        "sensor-credential" -> UdhSensorCredential.fromAttributes(resource.attributes)
        "sensor-subscription" -> UdhSensorSubscription.fromAttributes(resource.attributes)
        "group" -> UdhGroup.fromAttributes(resource.attributes)
        "viz-group" -> UdhVizGroup.fromAttributes(resource.attributes)
        "dashboard" -> UdhDashboard.fromAttributes(resource.attributes)
        else -> throw RuntimeException("unknown resource type ${resource.type}")
    }
}
