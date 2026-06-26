package net.teuto.udh.schema

import com.expediagroup.graphql.server.extensions.getFromContext
import com.expediagroup.graphql.server.operations.Mutation
import graphql.schema.DataFetchingEnvironment
import jakarta.ws.rs.BadRequestException
import jakarta.ws.rs.ForbiddenException
import jakarta.ws.rs.NotAuthorizedException
import jakarta.ws.rs.NotFoundException
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import net.teuto.udh.*
import org.keycloak.email.EmailSenderProvider
import org.keycloak.representations.idm.authorization.DecisionStrategy
import org.keycloak.representations.idm.authorization.ScopePermissionRepresentation
import java.util.stream.Collectors

@Serializable
data class AttributePatch(val key: String, val value: String?)

sealed interface CommonMutation : HasAttributes {
    fun patchAttributes(attributes: List<AttributePatch>, dfe: DataFetchingEnvironment): List<Attribute> {
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        val targetGenResource = getUdhResource(ctx)
        if (!hasPermissionScopes(targetGenResource.kcResource, listOf(ADMIN_SCOPE), ctx, ctx.evaluationContext)) {
            throw ForbiddenException()
        }
        attributes.forEach { (name, value) ->
            ensureValidName(name)
            if (value == null) {
                targetGenResource.kcResource.removeAttribute("${ATTR_PREFIX}${name}")
            } else {
                targetGenResource.kcResource.setAttribute(
                    "${ATTR_PREFIX}${name}",
                    listOf(validateAttributeValue(value))
                )
            }
        }
        targetGenResource.getResourceModel().postAttributeChange(ctx, delayedActionsList, targetGenResource)
        return attributes(dfe)
    }

    fun createPermission(
        permission: GraphqlPermission,
        dfe: DataFetchingEnvironment
    ): String {
        ensureValidName(permission.name)
        val ctx = dfe.getAuthzContextOrThrow()
        val targetGenResource = getUdhResource(ctx)
        if (!hasPermissionScopes(targetGenResource.kcResource, listOf(ADMIN_SCOPE), ctx, ctx.evaluationContext)) {
            throw ForbiddenException()
        }
        val validScopes = targetGenResource.resourceType.getPrefixedScopes().toSet()
        if (permission.scopes.any { it !in validScopes }) {
            throw BadRequestException()
        }
        val resolvedScopes = permission.scopes.map { createScope(it, ctx).id }
        val policyIds = permission.tenantPrincipals.orEmpty().map {
            ensureTenantPolicy(UdhTenant(it.tenant), ctx)
        } + permission.groupPrincipals.orEmpty().map {
            ensureGroupPolicy(UdhGroup(it.tenant, it.group), ctx)
        } + permission.projectPrincipals.orEmpty().map {
            ensureResourcePolicy(UdhProject(it.tenant, it.project).path, ctx)
        } + permission.vizGroupPrincipals.orEmpty().map {
            ensureResourcePolicy(UdhVizGroup(it.tenant, it.vizGroup).path, ctx)
        } + permission.userPrincipals.orEmpty().map {
            ensureUserPolicy(it.userId, ctx)
        } + if (permission.allowAllAuthenticatedUsers == true) {
            listOf(getAllAuthenticatedUsersPolicy(ctx))
        } else {
            listOf()
        }
        lookupPermission(targetGenResource.kcResource, permission.name, ctx)?.let {
            ctx.policyStore.delete(it.id)
            // without flushing, re-creating with same name in same transaction fails
            ctx.entityManager.flush()
        }
        val policy = ScopePermissionRepresentation()
        policy.name = targetGenResource.path.plus("permission", permission.name).toHash()
        policy.addResource(targetGenResource.kcResource.id)
        policy.scopes = resolvedScopes.toSet()
        policy.policies = policyIds.toSet()
        policy.decisionStrategy = DecisionStrategy.AFFIRMATIVE
        policy.description = permission.name
        createPolicy(policy, ctx.policyStore, ctx.resourceServer)
        return permission.name
    }

    fun deletePermission(permission: String, dfe: DataFetchingEnvironment): String {
        val ctx = dfe.getAuthzContextOrThrow()
        val targetGenResource = getUdhResource(ctx)
        if (!hasPermissionScopes(targetGenResource.kcResource, listOf(ADMIN_SCOPE), ctx, ctx.evaluationContext)) {
            throw ForbiddenException()
        }
        val permissionObj =
            lookupPermission(targetGenResource.kcResource, permission, ctx) ?: throw NotFoundException()
        ctx.policyStore.delete(permissionObj.id)

        return permission
    }
}

fun createResourceByPath(resourcePath: ResourcePath, dfe: DataFetchingEnvironment): Any? {
    ensureValidName(resourcePath.path.last().second)
    val ctx = dfe.getAuthzContextOrThrow()
    val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
    return executeAction(
        resourcePath.parent()!!,
        Action.Create(resourcePath.path.last().first, resourcePath.path.last().second),
        ctx,
        delayedActionsList,
        null
    )
}

fun deleteResourceByPath(resourcePath: ResourcePath, dfe: DataFetchingEnvironment) {
    ensureValidName(resourcePath.path.last().second)
    val ctx = dfe.getAuthzContextOrThrow()
    val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
    executeAction(
        resourcePath.parent()!!,
        Action.Delete(resourcePath.path.last().first, resourcePath.path.last().second),
        ctx,
        delayedActionsList,
        null
    )
}

data class UserCreate (
    val tenants: List<TenantQuery>,
    val groups: List<GroupQuery>,
    val firstName: String,
    val lastName: String,
    val email: String,
)

class RootMutation : Mutation {
    fun createTenant(tenant: String, dfe: DataFetchingEnvironment): TenantMutation {
        createResourceByPath(UdhTenant(tenant).path, dfe)
        return TenantMutation(tenant)
    }

    fun tenant(tenant: String, dfe: DataFetchingEnvironment): TenantMutation {
        return if (checkViewAccess(UdhTenant(tenant).path, dfe)) {
            TenantMutation(tenant)
        } else {
            throw NotFoundException()
        }
    }

    fun deleteTenant(tenant: String, dfe: DataFetchingEnvironment): String {
        deleteResourceByPath(UdhTenant(tenant).path, dfe)
        return tenant
    }

    fun createUser(user: UserCreate, dfe: DataFetchingEnvironment): UserQuery {
        val ctx = dfe.getAuthzContextOrThrow()
        user.tenants.forEach { tenant ->
            val tenantRes = UdhTenant(tenant.tenant).path.getResource(ctx) ?: throw NotFoundException()
            if (!hasPermissionScopes(tenantRes, listOf(ADMIN_SCOPE), ctx, ctx.evaluationContext)) {
                throw NotFoundException()
            }
        }
        user.groups.forEach { group ->
            val tenantRes = UdhGroup(group.tenant, group.group).path.getResource(ctx) ?: throw NotFoundException()
            if (!hasPermissionScopes(tenantRes, listOf(ADMIN_SCOPE), ctx, ctx.evaluationContext)) {
                throw NotFoundException()
            }
        }
        // needs to be admin for all tenants/groups
        // needs to have at least one tenant/group
        if (user.tenants.isEmpty() && user.groups.isEmpty()) {
            throw BadRequestException()
        }
        val newUser = ctx.session.users().addUser(ctx.realm, user.email)
        newUser.email = user.email
        newUser.firstName = user.firstName
        newUser.lastName = user.lastName
        newUser.isEnabled = true
        newUser.setAttribute("showName", listOf("true"))
        user.tenants.forEach { tenant ->
            ctx.realm.getGroupById(tenantGroupId(tenant.tenant))?.let {
                newUser.joinGroup(it)
            }
        }
        user.groups.forEach { group ->
            ctx.realm.getGroupById(UdhGroup(group.tenant, group.group).path.toHash())?.let {
                newUser.joinGroup(it)
            }
        }
        return UserQuery(newUser.id)
    }

    fun helpdesk(dfe: DataFetchingEnvironment, title: String, description: String): Boolean {
        val ctx = dfe.getAuthzContextOrThrow()
        val user = ctx.userModel ?: throw NotAuthorizedException("unauthorized")
        if (title.length !in 3..128 || description.length !in 20..1024) {
            throw BadRequestException()
        }

        val tenantNames = user.groupsStream.map {
            it.parent?.name ?: it.name
        }.collect(Collectors.toSet()).map {
            val res = UdhTenant(it).path.getUdhResource(ctx)
            res?.customAttribute(UdhTenant.ATTR_DISPLAY_NAME) ?: it
        }.sorted().joinToString(", ")

        val helpdeskEmail = System.getenv("HELPDESK_EMAIL")
        if (helpdeskEmail != null && helpdeskEmail != "") {
            val emailSender = ctx.session.getProvider(EmailSenderProvider::class.java)
            emailSender.send(ctx.realm.smtpConfig, helpdeskEmail, "[Urbanstack Helpdesk] $title", "Von: ${user.firstName} ${user.lastName} <${user.email}> ($tenantNames)\n\nBeschreibung:\n$description", null)
            return true
        } else {
            return false
        }
    }

    fun rotatePersonalCredential(dfe: DataFetchingEnvironment): PersonalCredential {
        val ctx = dfe.getAuthzContextOrThrow()
        val user = ctx.userModel ?: throw NotAuthorizedException("unauthorized")
        val client = getOrCreatePersonalCredentialClient(ctx.session, user.id, true)
        return PersonalCredential(client.clientId, client.secret)
    }
}

class TenantMutation(tenant: String) : TenantQuery(tenant), CommonMutation {
    fun createProject(project: String, dfe: DataFetchingEnvironment): ProjectMutation {
        createResourceByPath(UdhProject(tenant, project).path, dfe)
        return ProjectMutation(tenant, project)
    }

    fun project(project: String, dfe: DataFetchingEnvironment): ProjectMutation {
        return if (checkViewAccess(UdhProject(tenant, project).path, dfe)) {
            ProjectMutation(tenant, project)
        } else {
            throw NotFoundException()
        }
    }

    fun deleteProject(project: String, dfe: DataFetchingEnvironment): String {
        deleteResourceByPath(UdhProject(tenant, project).path, dfe)
        return project
    }

    fun createGroup(group: String, dfe: DataFetchingEnvironment): GroupMutation {
        createResourceByPath(UdhGroup(tenant, group).path, dfe)
        return GroupMutation(tenant, group)
    }

    fun group(group: String, dfe: DataFetchingEnvironment): GroupMutation {
        return if (checkViewAccess(UdhGroup(tenant, group).path, dfe)) {
            GroupMutation(tenant, group)
        } else {
            throw NotFoundException()
        }
    }

    fun deleteGroup(group: String, dfe: DataFetchingEnvironment): String {
        deleteResourceByPath(UdhGroup(tenant, group).path, dfe)
        return group
    }

    fun createVizGroup(vizGroup: String, dfe: DataFetchingEnvironment): VizGroupMutation {
        createResourceByPath(UdhVizGroup(tenant, vizGroup).path, dfe)
        return VizGroupMutation(tenant, vizGroup)
    }

    fun vizGroup(vizGroup: String, dfe: DataFetchingEnvironment): VizGroupMutation {
        return if (checkViewAccess(UdhVizGroup(tenant, vizGroup).path, dfe)) {
            VizGroupMutation(tenant, vizGroup)
        } else {
            throw NotFoundException()
        }
    }

    fun deleteVizGroup(vizGroup: String, dfe: DataFetchingEnvironment): String {
        deleteResourceByPath(UdhVizGroup(tenant, vizGroup).path, dfe)
        return vizGroup
    }

    fun createCitytool(citytool: String, path: String, dfe: DataFetchingEnvironment): CitytoolMutation {
        ensureValidName(citytool)
        ensureValidName(path)
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        executeAction(
            UdhTenant(tenant).path,
            Action.Create(
                "citytool",
                citytool,
            ),
            ctx,
            delayedActionsList,
            Json.encodeToString<UdhCitytool.CitytoolConfig>(UdhCitytool.CitytoolConfig(path))
        )
        return CitytoolMutation(tenant, citytool)
    }

    fun citytool(citytool: String, dfe: DataFetchingEnvironment): CitytoolMutation {
        return if (checkViewAccess(UdhCitytool(tenant, citytool).path, dfe)) {
            CitytoolMutation(tenant, citytool)
        } else {
            throw NotFoundException()
        }
    }

    fun deleteCitytool(citytool: String, dfe: DataFetchingEnvironment): String {
        deleteResourceByPath(UdhCitytool(tenant, citytool).path, dfe)
        return citytool
    }

    fun createSharedApp(sharedApp: String, config: UdhSharedApp.SharedAppConfig, dfe: DataFetchingEnvironment): SharedAppMutation {
        ensureValidName(sharedApp)
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        executeAction(
            UdhTenant(tenant).path,
            Action.Create(
                "shared-app",
                sharedApp,
            ),
            ctx,
            delayedActionsList,
            Json.encodeToString<UdhSharedApp.SharedAppConfig>(config)
        )
        return SharedAppMutation(tenant, sharedApp)
    }

    fun sharedApp(sharedApp: String, dfe: DataFetchingEnvironment): SharedAppMutation {
        return if (checkViewAccess(UdhSharedApp(tenant, sharedApp).path, dfe)) {
            SharedAppMutation(tenant, sharedApp)
        } else {
            throw NotFoundException()
        }
    }

    fun deleteSharedApp(sharedApp: String, dfe: DataFetchingEnvironment): String {
        deleteResourceByPath(UdhSharedApp(tenant, sharedApp).path, dfe)
        return sharedApp
    }

    fun createDedicatedApp(dedicatedApp: String, dfe: DataFetchingEnvironment): DedicatedAppMutation {
        ensureValidName(dedicatedApp)
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        executeAction(
            UdhTenant(tenant).path,
            Action.Create(
                DEDICATED_APP_TYPE.resourceTypeName,
                dedicatedApp,
            ),
            ctx,
            delayedActionsList,
            null
        )
        return DedicatedAppMutation(tenant, dedicatedApp)
    }

    fun dedicatedApp(dedicatedApp: String, dfe: DataFetchingEnvironment): DedicatedAppMutation {
        return if (checkViewAccess(UdhDedicatedApp(tenant, dedicatedApp).path, dfe)) {
            DedicatedAppMutation(tenant, dedicatedApp)
        } else {
            throw NotFoundException()
        }
    }

    fun deleteDedicatedApp(dedicatedApp: String, dfe: DataFetchingEnvironment): String {
        deleteResourceByPath(UdhDedicatedApp(tenant, dedicatedApp).path, dfe)
        return dedicatedApp
    }
}

data class SensorCredentialResult(val username: String, val password: String)

class ProjectMutation(tenant: String, project: String) : ProjectQuery(tenant, project), CommonMutation {
    fun createSensorCredential(sensorCredential: String, dfe: DataFetchingEnvironment): SensorCredentialResult {
        val result = createResourceByPath(UdhSensorCredential(tenant, project, sensorCredential).path, dfe) as Map<*, *>
        val username = result["username"] as String
        val password = result["password"] as String

        return SensorCredentialResult(username, password)
    }

    fun rotateSensorCredential(sensorCredential: String, dfe: DataFetchingEnvironment): SensorCredentialResult {
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        val result = executeAction(
            UdhSensorCredential(tenant, project, sensorCredential).path,
            Action.CustomAction("rotate"),
            ctx,
            delayedActionsList,
            null
        ) as Map<*, *>
        val username = result["username"] as String
        val password = result["password"] as String

        return SensorCredentialResult(username, password)
    }

    fun sensorCredential(sensorCredential: String, dfe: DataFetchingEnvironment): SensorCredentialMutation {
        return if (checkViewAccess(UdhSensorCredential(tenant, project, sensorCredential).path, dfe)) {
            SensorCredentialMutation(tenant, project, sensorCredential)
        } else {
            throw NotFoundException()
        }
    }

    fun deleteSensorCredential(sensorCredential: String, dfe: DataFetchingEnvironment): String {
        deleteResourceByPath(UdhSensorCredential(tenant, project, sensorCredential).path, dfe)

        return sensorCredential
    }

    fun createSensorSubscription(
        sensorSubscription: String,
        config: UdhSensorSubscription.SubscriptionConfig,
        dfe: DataFetchingEnvironment
    ): SensorSubscriptionMutation {
        ensureValidName(sensorSubscription)
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        executeAction(
            UdhProject(tenant, project).path,
            Action.Create(
                "sensor-subscription",
                sensorSubscription,
            ),
            ctx,
            delayedActionsList,
            Json.encodeToString<UdhSensorSubscription.SubscriptionConfig>(config)
        )
        return SensorSubscriptionMutation(tenant, project, sensorSubscription)
    }

    fun sensorSubscription(sensorSubscription: String, dfe: DataFetchingEnvironment): SensorSubscriptionMutation {
        return if (checkViewAccess(UdhSensorSubscription(tenant, project, sensorSubscription).path, dfe)) {
            SensorSubscriptionMutation(tenant, project, sensorSubscription)
        } else {
            throw NotFoundException()
        }
    }

    fun deleteSensorSubscription(
        sensorSubscription: String,
        dfe: DataFetchingEnvironment
    ): String {
        deleteResourceByPath(UdhSensorSubscription(tenant, project, sensorSubscription).path, dfe)
        return sensorSubscription
    }

    fun createDataset(
        dataset: String,
        config: UdhDataset.DatasetConfig,
        dfe: DataFetchingEnvironment
    ): DatasetMutation {
        ensureValidName(dataset)
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        executeAction(
            UdhProject(tenant, project).path,
            Action.Create(
                "dataset",
                dataset,
            ),
            ctx,
            delayedActionsList,
            Json.encodeToString<UdhDataset.DatasetConfig>(config)
        )
        return DatasetMutation(tenant, project, dataset)
    }

    fun dataset(dataset: String, dfe: DataFetchingEnvironment): DatasetMutation {
        return if (checkViewAccess(UdhDataset(tenant, project, dataset).path, dfe)) {
            DatasetMutation(tenant, project, dataset)
        } else {
            throw NotFoundException()
        }
    }

    fun deleteDataset(
        dataset: String,
        dfe: DataFetchingEnvironment
    ): String {
        deleteResourceByPath(UdhDataset(tenant, project, dataset).path, dfe)
        return dataset
    }

    fun refreshDataset(dataset: String, dfe: DataFetchingEnvironment): DatasetMutation {
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        executeAction(
            UdhDataset(tenant, project, dataset).path,
            Action.CustomAction("refresh"),
            ctx,
            delayedActionsList,
            null
        )
        return DatasetMutation(tenant, project, dataset)
    }
}

class GroupMutation(tenant: String, group: String) : GroupQuery(tenant, group), CommonMutation

class VizGroupMutation(tenant: String, vizGroup: String) : VizGroupQuery(tenant, vizGroup), CommonMutation {
    fun createDashboard(dashboard: String, dfe: DataFetchingEnvironment): DashboardMutation {
        createResourceByPath(UdhDashboard(tenant, vizGroup, dashboard).path, dfe)
        return DashboardMutation(tenant, vizGroup, dashboard)
    }

    fun createDashboardWithTitle(title: String, dfe: DataFetchingEnvironment): DashboardMutation {
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        val result = executeAction(
            UdhVizGroup(tenant, vizGroup).path,
            Action.CustomAction(
                "create-dashboard",
            ),
            ctx,
            delayedActionsList,
            Json.encodeToString(UdhVizGroup.CreateDashboardBody(title))
        ) as Map<*, *>
        return DashboardMutation(tenant, vizGroup, result["dashboardName"]!! as String)
    }

    fun dashboard(dashboard: String, dfe: DataFetchingEnvironment): DashboardMutation {
        return if (checkViewAccess(UdhDashboard(tenant, vizGroup, dashboard).path, dfe)) {
            DashboardMutation(tenant, vizGroup, dashboard)
        } else {
            throw NotFoundException()
        }
    }

    fun deleteDashboard(dashboard: String, dfe: DataFetchingEnvironment): String {
        deleteResourceByPath(UdhDashboard(tenant, vizGroup, dashboard).path, dfe)
        return dashboard
    }

    fun createPublishedQuery(
        publishedQuery: String,
        config: UdhPublishedQuery.QueryConfig,
        dfe: DataFetchingEnvironment
    ): PublishedQueryMutation {
        ensureValidName(publishedQuery)
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        executeAction(
            UdhVizGroup(tenant, vizGroup).path,
            Action.Create(
                "published-query",
                publishedQuery,
            ),
            ctx,
            delayedActionsList,
            Json.encodeToString<UdhPublishedQuery.QueryConfig>(config)
        )
        return PublishedQueryMutation(tenant, vizGroup, publishedQuery)
    }

    fun publishedQuery(publishedQuery: String, dfe: DataFetchingEnvironment): PublishedQueryMutation {
        return if (checkViewAccess(UdhPublishedQuery(tenant, vizGroup, publishedQuery).path, dfe)) {
            PublishedQueryMutation(tenant, vizGroup, publishedQuery)
        } else {
            throw NotFoundException()
        }
    }

    fun deletePublishedQuery(publishedQuery: String, dfe: DataFetchingEnvironment): String {
        deleteResourceByPath(UdhPublishedQuery(tenant, vizGroup, publishedQuery).path, dfe)
        return publishedQuery
    }
}

class DashboardMutation(tenant: String, vizGroup: String, dashboard: String) :
    DashboardQuery(tenant, vizGroup, dashboard), CommonMutation

class SensorCredentialMutation(tenant: String, project: String, sensorCredential: String) :
    SensorCredentialQuery(tenant, project, sensorCredential), CommonMutation

class SensorSubscriptionMutation(tenant: String, project: String, sensorSubscription: String) :
    SensorSubscriptionQuery(tenant, project, sensorSubscription), CommonMutation

class DatasetMutation(tenant: String, project: String, dataset: String) :
    DatasetQuery(tenant, project, dataset), CommonMutation

class PublishedQueryMutation(tenant: String, vizGroup: String, publishedQuery: String) :
    PublishedQueryQuery(tenant, vizGroup, publishedQuery), CommonMutation

class CitytoolMutation(tenant: String, citytool: String) :
    CitytoolQuery(tenant, citytool), CommonMutation {
    fun updateStars(stars: Int?, dfe: DataFetchingEnvironment): Int? {
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        executeAction(
            UdhCitytool(tenant, citytool).path,
            Action.CustomAction("update-stars"),
            ctx,
            delayedActionsList,
            Json.encodeToString(stars)
        )
        return stars
    }

    fun updatePath(path: String, dfe: DataFetchingEnvironment): String {
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        executeAction(
            UdhCitytool(tenant, citytool).path,
            Action.CustomAction("update-path"),
            ctx,
            delayedActionsList,
            Json.encodeToString(UdhCitytool.CitytoolConfig(path))
        )
        return path
    }
}

class SharedAppMutation(tenant: String, sharedApp: String): SharedAppQuery(tenant, sharedApp), CommonMutation {
    fun update(config: UdhSharedApp.UpdateSharedAppConfig, dfe: DataFetchingEnvironment): SharedAppMutation {
        val ctx = dfe.getAuthzContextOrThrow()
        val delayedActionsList = dfe.getFromContext<DelayedActionsList>()!!
        executeAction(
            UdhSharedApp(tenant, sharedApp).path,
            Action.CustomAction("update"),
            ctx,
            delayedActionsList,
            Json.encodeToString(config)
        )
        return this
    }
}

class DedicatedAppMutation(tenant: String, dedicatedApp: String) :
    DedicatedAppQuery(tenant, dedicatedApp), CommonMutation
