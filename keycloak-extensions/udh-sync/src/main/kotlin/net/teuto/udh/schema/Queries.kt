package net.teuto.udh.schema

import com.expediagroup.graphql.generator.annotations.GraphQLIgnore
import com.expediagroup.graphql.generator.annotations.GraphQLName
import com.expediagroup.graphql.server.extensions.getFromContext
import com.expediagroup.graphql.server.operations.Query
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import graphql.schema.DataFetchingEnvironment
import jakarta.ws.rs.ForbiddenException
import jakarta.ws.rs.NotAuthorizedException
import kotlinx.serialization.Serializable
import net.teuto.udh.*
import org.apache.http.client.utils.URLEncodedUtils
import org.apache.http.message.BasicNameValuePair
import org.keycloak.authorization.attribute.Attributes
import org.keycloak.authorization.common.DefaultEvaluationContext
import org.keycloak.authorization.model.Policy
import org.keycloak.models.KeycloakSession
import org.keycloak.models.utils.ModelToRepresentation
import org.keycloak.representations.idm.authorization.GroupPolicyRepresentation
import org.keycloak.representations.idm.authorization.UserPolicyRepresentation
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpRequest.BodyPublishers
import java.net.http.HttpResponse.BodyHandlers
import java.util.stream.Collectors

sealed interface KeycloakGroup {
    val tenant: String
    fun keycloakGroupPath(): String
}

@Serializable
data class PersonalCredential (
    val username: String,
    val password: String,
)

@GraphQLName("User")
data class UserQuery(val userId: String) // might be extended in the future

sealed interface HasAttributes {
    @GraphQLIgnore
    fun getUdhResource(ctx: AuthzContext): UdhResource<*>

    fun attributes(dfe: DataFetchingEnvironment): List<Attribute> {
        val ctx = dfe.getAuthzContextOrThrow()
        return getUdhResource(ctx).customAttributes()
            .map(::Attribute)
    }

    fun attribute(attribute: String, dfe: DataFetchingEnvironment): String? {
        val ctx = dfe.getAuthzContextOrThrow()
        return getUdhResource(ctx).customAttribute(attribute)
    }

    fun name(dfe: DataFetchingEnvironment): String? {
        return attribute("name", dfe)
    }

    fun scopes(dfe: DataFetchingEnvironment): Scopes {
        val ctx = dfe.getAuthzContextOrThrow()
        val targetGenResource = getUdhResource(ctx)
        val allScopes = targetGenResource.resourceType.getPrefixedScopes()
        val granted = allScopes.filter {
            hasPermissionScopes(
                targetGenResource.kcResource,
                listOf(it),
                ctx,
                ctx.evaluationContext
            )
        }
        return Scopes(
            allScopes,
            granted
        )
    }

    fun hasScopes(scopes: List<String>, dfe: DataFetchingEnvironment): Boolean {
        val ctx = dfe.getAuthzContextOrThrow()
        val targetGenResource = getUdhResource(ctx)
        return hasPermissionScopes(targetGenResource.kcResource, scopes, ctx, ctx.evaluationContext)
    }

    fun permissions(dfe: DataFetchingEnvironment): List<GraphqlPermission>? {
        val ctx = dfe.getAuthzContextOrThrow()
        val res = getUdhResource(ctx).kcResource
        if (!hasPermissionScopes(res, listOf(ADMIN_SCOPE), ctx, ctx.evaluationContext)) {
            return null
        }
        return ctx.policyStore.findByResource(ctx.resourceServer, res)
            .map { graphqlPermissionToRep(it, ctx) }
            .sortedBy { it.name }
    }
}

data class Scopes(
    val all: List<String>,
    val granted: List<String>,
)

@GraphQLName("Permission")
data class GraphqlPermission(
    val name: String,
    val scopes: List<String>,
    val tenantPrincipals: List<TenantQuery>?,
    val groupPrincipals: List<GroupQuery>?,
    val projectPrincipals: List<ProjectQuery>?,
    val vizGroupPrincipals: List<VizGroupQuery>?,
    val userPrincipals: List<UserQuery>?,
    val allowAllAuthenticatedUsers: Boolean?
)

fun graphqlPermissionToRep(permission: Policy, ctx: AuthzContext): GraphqlPermission {
    val scopes = permission.scopes.map { it.name }.sorted()

    val tenantPrincipals = mutableListOf<TenantQuery>()
    val groupPrincipals = mutableListOf<GroupQuery>()
    val projectPrincipals = mutableListOf<ProjectQuery>()
    val vizGroupPrincipals = mutableListOf<VizGroupQuery>()
    val userPrincipals = mutableListOf<UserQuery>()
    var allowAllAuthenticatedUsers = false
    permission.associatedPolicies.forEach { policy ->
        when (policy.type) {
            "group" -> {
                ModelToRepresentation.toRepresentation<GroupPolicyRepresentation>(
                    policy,
                    ctx.authProvider,
                    false,
                    false
                ).groups.forEach {
                    val group = ctx.realm.getGroupById(it.id)
                    if (group.parentId == null) {
                        tenantPrincipals.add(TenantQuery(group.name))
                    } else {
                        groupPrincipals.add(GroupQuery(group.parent.name, group.name))
                    }
                }
            }

            "user" -> {
                if (policy.name == ALL_USERS_POLICY) {
                    allowAllAuthenticatedUsers = true
                } else {
                    ModelToRepresentation.toRepresentation<UserPolicyRepresentation>(
                        policy,
                        ctx.authProvider,
                        false,
                        false
                    ).users.forEach {
                        userPrincipals.add(UserQuery(it))
                    }
                }
            }

            DATA_HUB_RESOURCE_POLICY -> {
                val resPrincipal = ModelToRepresentation.toRepresentation<DatahubResourcePolicyRepresentation>(
                    policy,
                    ctx.authProvider,
                    false,
                    false
                ).resourcePrincipal
                val resource = ctx.resourceStore.findByName(ctx.resourceServer, resPrincipal)
                when (resource.type) {
                    "viz-group" -> {
                        val res = UdhVizGroup.fromAttributes(resource.attributes)
                        vizGroupPrincipals.add(VizGroupQuery(res.tenant, res.vizGroup))
                    }

                    "project" -> {
                        val res = UdhProject.fromAttributes(resource.attributes)
                        projectPrincipals.add(ProjectQuery(res.tenant, res.project))
                    }
                }
            }

            else -> {
                LOGGER.error("unknown policy type: ${policy.type}")
            }
        }
    }
    return GraphqlPermission(
        scopes = scopes,
        name = permission.description,
        tenantPrincipals = tenantPrincipals,
        groupPrincipals = groupPrincipals,
        projectPrincipals = projectPrincipals,
        userPrincipals = userPrincipals,
        vizGroupPrincipals = vizGroupPrincipals,
        allowAllAuthenticatedUsers = allowAllAuthenticatedUsers,
    )
}

fun checkViewAccess(path: ResourcePath, dfe: DataFetchingEnvironment): Boolean {
    if (!NAME_REGEX.matches(path.path.last().second)) {
        return false
    }
    val ctx = dfe.getAuthzContextOrThrow()
    val res = path.getResource(ctx) ?: return false
    return hasPermissionScopes(res, listOf(VIEW_SCOPE), ctx, ctx.evaluationContext)
}

fun <T : UdhResourceModel> getViewableResourceList(
    resourceType: ResourceType<T>,
    dfe: DataFetchingEnvironment,
    names: Map<String, String> = mapOf()
): List<T> {
    val ctx = dfe.getAuthzContextOrThrow()
    return lookupResources(ctx, resourceType, names).filter {
        hasPermissionScopes(
            it.kcResource,
            listOf(VIEW_SCOPE),
            ctx,
            ctx.evaluationContext
        )
    }.map { it.getResourceModel() }
}

class RootQuery : Query {
    fun tenant(tenant: String, dfe: DataFetchingEnvironment): TenantQuery? {
        return if (checkViewAccess(UdhTenant(tenant).path, dfe)) {
            TenantQuery(tenant)
        } else {
            null
        }
    }

    fun tenants(dfe: DataFetchingEnvironment): List<TenantQuery> {
        return getViewableResourceList(TENANT_TYPE, dfe)
            .sortedBy { it.tenant }
            .map { TenantQuery(it.tenant) }
    }

    fun publicAttributes(tenant: String, dfe: DataFetchingEnvironment): List<Attribute> {
        if (!NAME_REGEX.matches(tenant)) {
            return listOf()
        }
        val session = dfe.getFromContext<KeycloakSession>()!!
        val evaluationContext = DefaultEvaluationContext(AttributeIdentity(Attributes.from(mapOf())), session)
        val ctx = getAuthzContext(session, evaluationContext, null)
        return UdhTenant(tenant).path.getUdhResource(ctx)?.customAttributes()?.map(::Attribute) ?: return listOf()
    }

    data class PublicCitytool(
        val displayName: String,
        val path: String,
        val description: String,
        val indexPath: String?,
        val pictureUri: String?,
        val categories: List<CitytoolCategory>,
    )

    fun publicCitytools(tenant: String, dfe: DataFetchingEnvironment): List<PublicCitytool> {
        if (!NAME_REGEX.matches(tenant)) {
            return emptyList()
        }
        val session = dfe.getFromContext<KeycloakSession>()!!
        val evaluationContext = DefaultEvaluationContext(AttributeIdentity(Attributes.from(mapOf())), session)
        val ctx = getAuthzContext(session, evaluationContext, null)
        return lookupResources(ctx, CITYTOOL_TYPE, mapOf(TENANT_TYPE.resourceTypeName to tenant)).flatMap {
            val citytool = it.getResourceModel()
            val meta = citytool.getMeta()
            if (meta.showInCitizenhub) {
                val path = UdhCitytool.getPathAttribute(it)
                listOf(PublicCitytool(meta.name, path, meta.description, meta.indexPath, meta.pictureUri, meta.categories))
            } else {
                emptyList()
            }
        }
    }

    fun citytoolsInfo(dfe: DataFetchingEnvironment): List<CitytoolInformation> {
        dfe.getAuthzContextOrThrow()
        return UdhCitytool.getAllMeta().map { CitytoolInformation(it.key, it.value) }.sortedBy { it.citytool }
    }

    fun citytoolInfo(citytool: String, dfe: DataFetchingEnvironment): CitytoolInformation? {
        dfe.getAuthzContextOrThrow()
        return getCitytoolInfo(citytool)?.let { CitytoolInformation(citytool, it) }
    }

    fun dedicatedAppsInfo(dfe: DataFetchingEnvironment): List<DedicatedAppInformation> {
        dfe.getAuthzContextOrThrow()
        return UdhDedicatedApp.getAllMeta().map {
            DedicatedAppInformation(
                it.key,
                DedicatedAppMetaPublic.fromPrivate(it.value)
            )
        }.sortedBy { it.dedicatedApp }
    }

    fun dedicatedAppInfo(dedicatedApp: String, dfe: DataFetchingEnvironment): DedicatedAppInformation? {
        dfe.getAuthzContextOrThrow()
        return getDedicatedAppInfo(dedicatedApp)?.let { DedicatedAppInformation(dedicatedApp, it) }
    }

    fun project(tenant: String, project: String, dfe: DataFetchingEnvironment): ProjectQuery? {
        return if (checkViewAccess(UdhProject(tenant, project).path, dfe)) {
            ProjectQuery(tenant, project)
        } else {
            null
        }
    }

    fun vizGroup(tenant: String, vizGroup: String, dfe: DataFetchingEnvironment): VizGroupQuery? {
        return if (checkViewAccess(UdhVizGroup(tenant, vizGroup).path, dfe)) {
            VizGroupQuery(tenant, vizGroup)
        } else {
            null
        }
    }

    fun dashboard(tenant: String, vizGroup: String, dashboard: String, dfe: DataFetchingEnvironment): DashboardQuery? {
        return if (checkViewAccess(UdhDashboard(tenant, vizGroup, dashboard).path, dfe)) {
            DashboardQuery(tenant, vizGroup, dashboard)
        } else {
            null
        }
    }

    fun publishedQuery(
        tenant: String,
        vizGroup: String,
        publishedQuery: String,
        dfe: DataFetchingEnvironment
    ): PublishedQueryQuery? {
        return if (checkViewAccess(UdhPublishedQuery(tenant, vizGroup, publishedQuery).path, dfe)) {
            PublishedQueryQuery(tenant, vizGroup, publishedQuery)
        } else {
            null
        }
    }

    fun group(tenant: String, group: String, dfe: DataFetchingEnvironment): GroupQuery? {
        return if (checkViewAccess(UdhGroup(tenant, group).path, dfe)) {
            GroupQuery(tenant, group)
        } else {
            null
        }
    }

    fun sensorCredential(
        tenant: String,
        project: String,
        sensorCredential: String,
        dfe: DataFetchingEnvironment
    ): SensorCredentialQuery? {
        return if (checkViewAccess(UdhSensorCredential(tenant, project, sensorCredential).path, dfe)) {
            SensorCredentialQuery(tenant, project, sensorCredential)
        } else {
            null
        }
    }

    fun sensorSubscription(
        tenant: String,
        project: String,
        sensorSubscription: String,
        dfe: DataFetchingEnvironment
    ): SensorSubscriptionQuery? {
        return if (checkViewAccess(UdhSensorSubscription(tenant, project, sensorSubscription).path, dfe)) {
            SensorSubscriptionQuery(tenant, project, sensorSubscription)
        } else {
            null
        }
    }

    fun dataset(
        tenant: String,
        project: String,
        dataset: String,
        dfe: DataFetchingEnvironment
    ): DatasetQuery? {
        return if (checkViewAccess(UdhDataset(tenant, project, dataset).path, dfe)) {
            DatasetQuery(tenant, project, dataset)
        } else {
            null
        }
    }

    fun citytool(
        tenant: String,
        citytool: String,
        dfe: DataFetchingEnvironment
    ): CitytoolQuery? {
        return if (checkViewAccess(UdhCitytool(tenant, citytool).path, dfe)) {
            CitytoolQuery(tenant, citytool)
        } else {
            null
        }
    }

    fun sharedApp(
        tenant: String,
        sharedApp: String,
        dfe: DataFetchingEnvironment
    ): SharedAppQuery? {
        return if (checkViewAccess(UdhSharedApp(tenant, sharedApp).path, dfe)) {
            SharedAppQuery(tenant, sharedApp)
        } else {
            null
        }
    }

    fun dedicatedApp(
        tenant: String,
        dedicatedApp: String,
        dfe: DataFetchingEnvironment
    ): DedicatedAppQuery? {
        return if (checkViewAccess(UdhDedicatedApp(tenant, dedicatedApp).path, dfe)) {
            DedicatedAppQuery(tenant, dedicatedApp)
        } else {
            null
        }
    }

    @Serializable
    class PublicSharedApp(
        val tenant: String,
        val tenantDisplayName: String?,
        val sharedApp: String,
        val displayName: String,
        val description: String,
        val adminContact: String,
        val url: String,
        val pictureUri: String?,
        val categories: List<CitytoolCategory>,
    )

    fun publicSharedApps(dfe: DataFetchingEnvironment): List<PublicSharedApp> {
        val ctx = dfe.getAuthzContextOrThrow()
        return lookupResources(ctx, SHARED_APP_TYPE, emptyMap()).map {
            val model = it.getResourceModel()
            val attributes = UdhSharedApp.SharedAppConfig.fromAttributes(it.kcResource.attributes)
            PublicSharedApp(
                tenant = model.tenant,
                tenantDisplayName = it.parent(ctx)?.customAttribute(UdhTenant.ATTR_DISPLAY_NAME),
                sharedApp = model.sharedApp,
                displayName = attributes.displayName,
                description = attributes.description,
                adminContact = attributes.adminContact,
                url = "https://${model.sharedAppHost}",
                pictureUri = attributes.pictureUri,
                categories = attributes.categories,
            )
        }
    }

    fun keycloakGroupMemberships(dfe: DataFetchingEnvironment): List<KeycloakGroup> {
        val ctx = dfe.getAuthzContextOrThrow()
        val user = ctx.userModel ?: throw NotAuthorizedException("unauthorized")
        return user.groupsStream.map {
            val groupName = it.name
            val parentName = it.parent?.name
            if (parentName == null) {
                TenantQuery(groupName)
            } else {
                GroupQuery(parentName, groupName)
            }
        }.collect(Collectors.toList<KeycloakGroup>())
    }

    fun personalCredential(dfe: DataFetchingEnvironment): PersonalCredential {
        val ctx = dfe.getAuthzContextOrThrow()
        val user = ctx.userModel ?: throw NotAuthorizedException("unauthorized")
        val client = getOrCreatePersonalCredentialClient(ctx.session, user.id, false)
        return PersonalCredential(client.clientId, client.secret)
    }

    fun clickhouseQuery(query: String, project: ProjectQuery? = null, dfe: DataFetchingEnvironment): Map<String, Any>? {
        val ctx = dfe.getAuthzContextOrThrow()
        val httpClient = HttpClient.newHttpClient()
        val urlParams = mutableListOf(
            BasicNameValuePair("default_format", "JSON"),
            BasicNameValuePair("output_format_write_statistics", "0"),
            // see PublishedQueryApplication.kt
            BasicNameValuePair("max_result_rows", "10000"), // too many rows
            BasicNameValuePair("max_result_bytes", "1000000"), // bytes => big rows
            BasicNameValuePair("max_execution_time", "10"), // seconds => expensive queries
            BasicNameValuePair(
                "timeout_before_checking_execution_speed", "1"
            ), // actually wait for expensive queries, don't cancel based on in-progress estimate
        )
        val responseJsonString = if (project != null) {
            // a specific project was requested, check if the user has the required permissions
            val udhProject = UdhProject(project.tenant, project.project)
            val res = udhProject.path.getResource(ctx) ?: return null
            if (!hasPermissionScopes(res, listOf("project:bucket-read"), ctx, ctx.evaluationContext)) {
                return null
            }
            // do query
            val encodedUrlParams = URLEncodedUtils.format(urlParams, Charsets.UTF_8)
            val fullUrl = "http://$CLICKHOUSE_HOST:8123?$encodedUrlParams"

            val httpRequest = HttpRequest.newBuilder().POST(BodyPublishers.ofString(query))
                .header("X-ClickHouse-User", udhProject.flatName)
                .header("X-ClickHouse-Key", CLICKHOUSE_PASSWORD_QUERYONLY)
                .header("X-ClickHouse-Format", "JSON")
                .uri(URI(fullUrl))
                .build()
            httpClient.send(httpRequest, BodyHandlers.ofString()).body()
        } else {
            // no specific project was requested, access to `sensor_messages`, queryonly user with projects as setting
            urlParams.add(BasicNameValuePair("SQL_projects", getFlatProjects(ctx, null, listOf("project:clickhouse-read")).joinToString(" ")))
            urlParams.add(BasicNameValuePair("readonly", "1"))

            // do query
            val encodedUrlParams = URLEncodedUtils.format(urlParams, Charsets.UTF_8)
            val fullUrl = "http://$CLICKHOUSE_HOST:8123?$encodedUrlParams"

            val httpRequest = HttpRequest.newBuilder().POST(BodyPublishers.ofString(query))
                .header("X-ClickHouse-User", "queryonly")
                .header("X-ClickHouse-Key", CLICKHOUSE_PASSWORD_QUERYONLY)
                .header("X-ClickHouse-Format", "JSON")
                .uri(URI(fullUrl))
                .build()
            httpClient.send(httpRequest, BodyHandlers.ofString()).body()
        }

        if (responseJsonString.startsWith("Code:")) {
            val flatProjectName = project?.let { UdhProject(it.tenant, it.project).flatName }
            LOGGER.warn("error for project $flatProjectName, query $query\n$responseJsonString")
            // Exceptions aren't in json format
            return mapOf(
                "meta" to emptyList<String>(),
                "data" to emptyList<String>(),
                "rows" to 0,
                "exception" to responseJsonString,
            )
        }

        // deserialize json
        return Gson().fromJson(responseJsonString, object: TypeToken<Map<String, Any>> () {}.type)
    }
}

@Serializable
class CitytoolInformation(val citytool: String, val info: CitytoolMeta) {
    fun installs(dfe: DataFetchingEnvironment): CitytoolInstalls {
        return getCitytoolInstalls(citytool, dfe)
    }

    fun requestCityToolLink(tenant: String, dfe: DataFetchingEnvironment): String {
        return getRequestCitytoolLink(tenant, citytool, dfe)
    }
}

@Serializable
@GraphQLName("DedicatedAppMeta")
data class DedicatedAppMetaPublic(
    val name: String,
    val description: String,
    val pictureUri: String? = null,
    val indexPath: String? = null,
    val categories: List<CitytoolCategory> = emptyList()
) {
    companion object {
        fun fromPrivate(priv: DedicatedAppMeta): DedicatedAppMetaPublic {
            return DedicatedAppMetaPublic(
                name = priv.name,
                description = priv.description,
                pictureUri = priv.pictureUri,
                indexPath = priv.indexPath,
                categories = priv.categories
            )
        }
    }
}

@Serializable
class DedicatedAppInformation(val dedicatedApp: String, val info: DedicatedAppMetaPublic) {
    fun requestCityToolLink(tenant: String, dfe: DataFetchingEnvironment): String {
        return getRequestCitytoolLink(tenant, info.name, dfe)
    }
}

data class Attribute(val key: String, val value: String) {
    constructor(entry: Map.Entry<String, String>) : this(entry.key, entry.value)
}

@Serializable
@GraphQLName("Tenant")
open class TenantQuery(override val tenant: String) : HasAttributes, KeycloakGroup {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhTenant(tenant).path.getUdhResource(ctx)!!
    }

    fun projects(dfe: DataFetchingEnvironment): List<ProjectQuery> {
        return getViewableResourceList(PROJECT_TYPE, dfe, mapOf(TENANT_TYPE.resourceTypeName to tenant))
            .sortedBy { it.project }
            .map {
                ProjectQuery(it.tenant, it.project)
            }
    }

    fun vizGroups(dfe: DataFetchingEnvironment): List<VizGroupQuery> {
        return getViewableResourceList(VIZ_GROUP_TYPE, dfe, mapOf(TENANT_TYPE.resourceTypeName to tenant))
            .sortedBy { it.vizGroup }
            .map {
                VizGroupQuery(it.tenant, it.vizGroup)
            }
    }

    fun groups(dfe: DataFetchingEnvironment): List<GroupQuery> {
        return getViewableResourceList(GROUP_TYPE, dfe, mapOf(TENANT_TYPE.resourceTypeName to tenant))
            .sortedBy { it.group }
            .map {
                GroupQuery(it.tenant, it.group)
            }
    }

    fun citytools(dfe: DataFetchingEnvironment): List<CitytoolQuery> {
        return getViewableResourceList(CITYTOOL_TYPE, dfe, mapOf(TENANT_TYPE.resourceTypeName to tenant))
            .sortedBy { it.citytool }
            .map {
                CitytoolQuery(it.tenant, it.citytool)
            }
    }

    fun sharedApps(dfe: DataFetchingEnvironment): List<SharedAppQuery> {
        return getViewableResourceList(SHARED_APP_TYPE, dfe, mapOf(TENANT_TYPE.resourceTypeName to tenant))
            .sortedBy { it.sharedApp }
            .map {
                SharedAppQuery(it.tenant, it.sharedApp)
            }
    }

    fun dedicatedApps(dfe: DataFetchingEnvironment): List<DedicatedAppQuery> {
        return getViewableResourceList(DEDICATED_APP_TYPE, dfe, mapOf(TENANT_TYPE.resourceTypeName to tenant))
            .sortedBy { it.dedicatedApp }
            .map {
                DedicatedAppQuery(it.tenant, it.dedicatedApp)
            }
    }

    fun requestCityToolLink(dfe: DataFetchingEnvironment, citytool: String): String {
        return getRequestCitytoolLink(tenant, citytool, dfe)
    }

    override fun keycloakGroupPath(): String {
        return tenantGroupId(tenant)
    }
}

@Serializable
@GraphQLName("Project")
open class ProjectQuery(val tenant: String, val project: String) : HasAttributes {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhProject(tenant, project).path.getUdhResource(ctx)!!
    }

    fun sensorCredentials(dfe: DataFetchingEnvironment): List<SensorCredentialQuery> {
        return getViewableResourceList(
            SENSOR_CREDENTIAL_TYPE,
            dfe,
            mapOf(TENANT_TYPE.resourceTypeName to tenant, PROJECT_TYPE.resourceTypeName to project)
        )
            .sortedBy { it.sensorCredential }
            .map {
                SensorCredentialQuery(it.tenant, it.project, it.sensorCredential)
            }
    }

    fun sensorSubscriptions(dfe: DataFetchingEnvironment): List<SensorSubscriptionQuery> {
        return getViewableResourceList(
            SENSOR_SUBSCRIPTION_TYPE,
            dfe,
            mapOf(TENANT_TYPE.resourceTypeName to tenant, PROJECT_TYPE.resourceTypeName to project)
        )
            .sortedBy { it.sensorSubscription }
            .map {
                SensorSubscriptionQuery(it.tenant, it.project, it.sensorSubscription)
            }
    }

    fun datasets(dfe: DataFetchingEnvironment): List<DatasetQuery> {
        return getViewableResourceList(
            DATASET_TYPE,
            dfe,
            mapOf(TENANT_TYPE.resourceTypeName to tenant, PROJECT_TYPE.resourceTypeName to project)
        )
            .sortedBy { it.dataset }
            .map {
                DatasetQuery(it.tenant, it.project, it.dataset)
            }
    }

    fun flatName(): String {
        return UdhProject(tenant, project).flatName
    }
}

@Serializable
@GraphQLName("SensorCredential")
open class SensorCredentialQuery(val tenant: String, val project: String, val sensorCredential: String) :
    HasAttributes {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhSensorCredential(tenant, project, sensorCredential).path.getUdhResource(ctx)!!
    }

    fun username(dfe: DataFetchingEnvironment): String {
        val ctx = dfe.getAuthzContextOrThrow()
        val cred = UdhSensorCredential(tenant, project, sensorCredential)
        val credentialHash = cred.path.toHash()
        return ctx.realm.clientsStream.filter { it.getAttribute("hash") == credentialHash }.findFirst().get().clientId
    }
}

data class SensorSubscriptionConfig(
    val uri: String,
    val topic: String,
    val format: String,
    val username: String,
)

data class SensorSubscriptionConnection(
    val state: DatahubResource.SubscriptionState,
    val error: String?,
    val lastMessageTimestamp: String?,
)

data class PublishedQueryConfig(
    val sql: String,
)

@Serializable
@GraphQLName("SensorSubscription")
open class SensorSubscriptionQuery(val tenant: String, val project: String, val sensorSubscription: String) :
    HasAttributes {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhSensorSubscription(tenant, project, sensorSubscription).path.getUdhResource(ctx)!!
    }

    fun config(dfe: DataFetchingEnvironment): SensorSubscriptionConfig {
        val ctx = dfe.getAuthzContextOrThrow()
        val attributes = getUdhResource(ctx).kcResource.attributes
        val sub = UdhSensorSubscription.SubscriptionConfig.fromAttributes(attributes)
        return SensorSubscriptionConfig(uri = sub.uri, topic = sub.topic, format = sub.format, username = sub.username)
    }

    fun connection(dfe: DataFetchingEnvironment): SensorSubscriptionConnection {
        val ctx = dfe.getAuthzContextOrThrow()
        val res = getUdhResource(ctx)
        return SensorSubscriptionConnection(
            res.kcResource.getAttribute(UdhSensorSubscription.ATTR_CONNECTION_STATE)?.firstOrNull()?.let {
                decodeJson<DatahubResource.SubscriptionState>(it)
            } ?: DatahubResource.SubscriptionState.CONNECTING,
            res.kcResource.getAttribute(UdhSensorSubscription.ATTR_CONNECTION_ERROR)?.firstOrNull(),
            res.kcResource.getAttribute(UdhSensorSubscription.ATTR_LAST_MESSAGE_TIMESTAMP)?.firstOrNull()
        )
    }
}

@Serializable
@GraphQLName("Dataset")
open class DatasetQuery(val tenant: String, val project: String, val dataset: String) :
    HasAttributes {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhDataset(tenant, project, dataset).path.getUdhResource(ctx)!!
    }

    fun config(dfe: DataFetchingEnvironment): UdhDataset.DatasetConfig {
        val ctx = dfe.getAuthzContextOrThrow()
        val attributes = getUdhResource(ctx).kcResource.attributes
        return UdhDataset.DatasetConfig.fromAttributes(attributes)
    }
}

@Serializable
@GraphQLName("Group")
open class GroupQuery(override val tenant: String, val group: String) : HasAttributes, KeycloakGroup {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhGroup(tenant, group).path.getUdhResource(ctx)!!
    }

    override fun keycloakGroupPath(): String {
        return "${tenantGroupId(tenant)}/${UdhGroup(tenant, group).path.toHash()}"
    }

    fun isMember(dfe: DataFetchingEnvironment): Boolean {
        val ctx = dfe.getAuthzContextOrThrow()
        val groupModel = ctx.realm.getGroupById(UdhGroup(tenant, group).path.toHash())
        return ctx.userModel?.isMemberOf(groupModel) == true
    }
}

@Serializable
@GraphQLName("VizGroup")
open class VizGroupQuery(val tenant: String, val vizGroup: String) : HasAttributes {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhVizGroup(tenant, vizGroup).path.getUdhResource(ctx)!!
    }

    fun dashboards(dfe: DataFetchingEnvironment): List<DashboardQuery> {
        return getViewableResourceList(
            DASHBOARD_TYPE,
            dfe,
            mapOf(TENANT_TYPE.resourceTypeName to tenant, VIZ_GROUP_TYPE.resourceTypeName to vizGroup)
        )
            .sortedBy { it.dashboard }
            .map {
                DashboardQuery(it.tenant, it.vizGroup, it.dashboard)
            }
    }

    fun publishedQueries(dfe: DataFetchingEnvironment): List<PublishedQueryQuery> {
        return getViewableResourceList(
            PUBLISHED_QUERY_TYPE,
            dfe,
            mapOf(TENANT_TYPE.resourceTypeName to tenant, VIZ_GROUP_TYPE.resourceTypeName to vizGroup)
        )
            .sortedBy { it.publishedQuery }
            .map {
                PublishedQueryQuery(it.tenant, it.vizGroup, it.publishedQuery)
            }
    }
}

@Serializable
@GraphQLName("Dashboard")
open class DashboardQuery(val tenant: String, val vizGroup: String, val dashboard: String) : HasAttributes {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhDashboard(tenant, vizGroup, dashboard).path.getUdhResource(ctx)!!
    }

    fun slug(): String {
        return UdhDashboard(tenant, vizGroup, dashboard).dashboardSlug
    }
}

@Serializable
@GraphQLName("PublishedQuery")
open class PublishedQueryQuery(val tenant: String, val vizGroup: String, val publishedQuery: String) : HasAttributes {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhPublishedQuery(tenant, vizGroup, publishedQuery).path.getUdhResource(ctx)!!
    }

    fun config(dfe: DataFetchingEnvironment): PublishedQueryConfig {
        val ctx = dfe.getAuthzContextOrThrow()
        val attributes = getUdhResource(ctx).kcResource.attributes
        val q = UdhPublishedQuery.QueryConfig.fromAttributes(attributes)
        return PublishedQueryConfig(sql = q.sql)
    }
}

@Serializable
data class CitytoolInstalls(
    val averageStars: Double?,
    val count: Int
)

fun getCitytoolInfo(citytool: String): CitytoolMeta? {
    return UdhCitytool.getAllMeta()[citytool]
}

fun getDedicatedAppInfo(dedicatedApp: String): DedicatedAppMetaPublic? {
    return UdhDedicatedApp.getAllMeta()[dedicatedApp]?.let(DedicatedAppMetaPublic::fromPrivate)
}

fun getCitytoolInstalls(citytool: String, dfe: DataFetchingEnvironment): CitytoolInstalls {
    val ctx = dfe.getAuthzContextOrThrow()

    var installs = 0
    var totalStars = 0
    var starsPresent = 0

    lookupResources(ctx, CITYTOOL_TYPE, mapOf(CITYTOOL_TYPE.resourceTypeName to citytool)).forEach { res ->
        val stars = UdhCitytool.getStarsAttribute(res)
        installs += 1
        if (stars != null) {
            totalStars += stars
            starsPresent += 1
        }
    }
    val averageStars = if (starsPresent == 0) {
        null
    } else {
        totalStars.toDouble() / starsPresent.toDouble()
    }
    return CitytoolInstalls(averageStars, installs)
}

fun getRequestCitytoolLink(
    tenant: String,
    citytool: String,
    dfe: DataFetchingEnvironment
): String {
    val ctx = dfe.getAuthzContextOrThrow()
    val res = UdhTenant(tenant).path.getUdhResource(ctx)
    val tenantDisplayName = res?.customAttribute(UdhTenant.ATTR_DISPLAY_NAME) ?: tenant
    val topicName = "Anfrage $citytool für $tenantDisplayName"
    val categorySlug = "$tenant/$CITYTOOL_REQUEST_CATEGORY_SLUG"
    val existingTopic = getDiscourseClient()?.findTopic(categorySlug, topicName)
    return if (existingTopic != null) {
        "/t/${existingTopic.slug}"
    } else {
        "/new-topic?title=$topicName&category=$categorySlug"
    }
}

@Serializable
@GraphQLName("Citytool")
open class CitytoolQuery(val tenant: String, val citytool: String) : HasAttributes {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhCitytool(tenant, citytool).path.getUdhResource(ctx)!!
    }

    fun info(): CitytoolMeta {
        return getCitytoolInfo(citytool)!!
    }

    fun stars(dfe: DataFetchingEnvironment): Int? {
        val ctx = dfe.getAuthzContextOrThrow()
        val res = getUdhResource(ctx)
        return UdhCitytool.getStarsAttribute(res)
    }

    fun path(dfe: DataFetchingEnvironment): String {
        val ctx = dfe.getAuthzContextOrThrow()
        val res = getUdhResource(ctx)
        return UdhCitytool.getPathAttribute(res)
    }

    fun installs(dfe: DataFetchingEnvironment): CitytoolInstalls {
        return getCitytoolInstalls(citytool, dfe)
    }
}

data class ReadonlySharedAppConfig(
    val imageRegistry: String,
    val registryUsername: String?,
    val hasPassword: Boolean,
    val imageRepository: String,
    val imageDigest: String,
    val displayName: String,
    val description: String,
    val adminContact: String,
    val pictureUri: String?,
    val categories: List<CitytoolCategory>,
)

@Serializable
@GraphQLName("SharedApp")
open class SharedAppQuery(val tenant: String, val sharedApp: String) : HasAttributes {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhSharedApp(tenant, sharedApp).path.getUdhResource(ctx)!!
    }

    fun config(dfe: DataFetchingEnvironment): ReadonlySharedAppConfig {
        val ctx = dfe.getAuthzContextOrThrow()
        val attributes = getUdhResource(ctx).kcResource.attributes
        val config = UdhSharedApp.SharedAppConfig.fromAttributes(attributes)
        return ReadonlySharedAppConfig(
            imageRegistry = config.imageRegistry,
            registryUsername = config.registryUsername,
            hasPassword = config.registryPassword != null,
            imageDigest = config.imageDigest,
            imageRepository = config.imageRepository,
            description = config.description,
            displayName = config.displayName,
            adminContact = config.adminContact,
            pictureUri = config.pictureUri,
            categories = config.categories,
        )
    }

    fun url(dfe: DataFetchingEnvironment): String {
        return "https://${UdhSharedApp(tenant, sharedApp).sharedAppHost}"
    }

    fun containerStatus(): ContainerStatus? {
        return UdhSharedApp(tenant, sharedApp).getContainerStatus()
    }

    fun containerLogs(lines: Int = 100, dfe: DataFetchingEnvironment): String? {
        val ctx = dfe.getAuthzContextOrThrow()
        if (!hasPermissionScopes(getUdhResource(ctx).kcResource, listOf(ADMIN_SCOPE), ctx, ctx.evaluationContext)) {
            throw ForbiddenException()
        }
        return UdhSharedApp(tenant, sharedApp).readContainerLogs(lines)
    }
}

@Serializable
@GraphQLName("DedicatedApp")
open class DedicatedAppQuery(val tenant: String, val dedicatedApp: String) : HasAttributes {
    @GraphQLIgnore
    override fun getUdhResource(ctx: AuthzContext): UdhResource<*> {
        return UdhDedicatedApp(tenant, dedicatedApp).path.getUdhResource(ctx)!!
    }

    fun info(): DedicatedAppMetaPublic {
        return getDedicatedAppInfo(dedicatedApp)!!
    }

    fun url(dfe: DataFetchingEnvironment): String {
        return "https://${UdhDedicatedApp(tenant, dedicatedApp).dedicatedAppHost}"
    }

    fun containerStatus(): ContainerStatus? {
        return UdhDedicatedApp(tenant, dedicatedApp).getContainerStatus()
    }

    fun containerLogs(lines: Int = 100, dfe: DataFetchingEnvironment): String? {
        val ctx = dfe.getAuthzContextOrThrow()
        if (!hasPermissionScopes(getUdhResource(ctx).kcResource, listOf(ADMIN_SCOPE), ctx, ctx.evaluationContext)) {
            throw ForbiddenException()
        }
        return UdhDedicatedApp(tenant, dedicatedApp).readContainerLogs(lines)
    }
}
