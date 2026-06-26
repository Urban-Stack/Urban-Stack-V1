package net.teuto.udh

import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.Json
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpRequest.BodyPublishers
import java.net.http.HttpResponse
import java.net.http.HttpResponse.BodyHandlers

// if the host is not set, this module does nothing
val DISCOURSE_HOST: String? = System.getenv("DISCOURSE_HOST")
val DISCOURSE_API_KEY: String? = System.getenv("DISCOURSE_API_KEY")
val DISCOURSE_USERNAME: String? = System.getenv("DISCOURSE_USERNAME")

const val CITYTOOL_REQUEST_CATEGORY_SLUG = "city-tools-anfragen"

@Serializable
data class DiscourseGroupResult(
    val group: DiscourseGroup?,
    // needed when setting watchingCategoryIds
    @SerialName("update_existing_users")
    val updateExistingUsers: String? = null,
)

@Serializable
data class DiscourseCategoryResult(
    val category: DiscourseCategory?,
)

open class EnumAsIntSerializer<T : Enum<*>>(
    serialName: String,
    val serialize: (v: T) -> Int,
    val deserialize: (v: Int) -> T
) : KSerializer<T> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor(serialName, PrimitiveKind.INT)

    override fun serialize(encoder: Encoder, value: T) {
        encoder.encodeInt(serialize(value))
    }

    override fun deserialize(decoder: Decoder): T {
        val v = decoder.decodeInt()
        return deserialize(v)
    }
}

private class VisibilityLevelSerializer : EnumAsIntSerializer<VisibilityLevel>(
    "VisibilityLevel",
    { it.level },
    { v -> VisibilityLevel.entries.first { it.level == v } }
)

@Serializable(with = VisibilityLevelSerializer::class)
enum class VisibilityLevel(val level: Int) {
    // visible for everyone
    PUBLIC(0),

    // visible for all logged-in users
    LOGGED_ON_USERS(1),

    // only visible for members of the group, moderators and admins
    MEMBERS(2),

    // only visible for moderators and admins
    STAFF(3),

    // only visible for group owners
    OWNERS(4),
}

private class PermissionTypeSerializer : EnumAsIntSerializer<PermissionType>(
    "PermissionType",
    { it.permission },
    { v -> PermissionType.entries.first { it.permission == v } }
)

@Serializable(with = PermissionTypeSerializer::class)
enum class PermissionType(val permission: Int) {
    // create and reply to topics
    FULL(1),

    // only reply to topics
    REPLY_ONLY(2),

    // only read topics
    READONLY(3),
}

@Serializable
data class DiscourseGroup(
    val id: Int,
    val name: String,
    @SerialName("full_name")
    val fullName: String? = null,
    val title: String? = null,
    @SerialName("visibility_level")
    val visibilityLevel: VisibilityLevel,
    @SerialName("members_visibility_level")
    val membersVisibilityLevel: VisibilityLevel,
    @SerialName("watching_category_ids")
    val watchingCategoryIds: List<Int>? = null,
)

@Serializable
data class GroupPermission(
    @SerialName("permission_type")
    val permissionType: PermissionType,
    @SerialName("group_name")
    val groupName: String,
)

@Serializable
data class DiscourseCategory(
    val id: Int,
    val name: String,
    val slug: String,
    val color: String,
    @SerialName("text_color")
    val textColor: String,
    @SerialName("moderating_group_ids")
    val moderatingGroupIds: List<Int> = emptyList(),
    @SerialName("parent_category_id")
    val parentCategoryId: Int? = null,
    // only used for get
    @SerialName("group_permissions")
    val groupPermissions: List<GroupPermission> = listOf(),
    // only used for create/update
    val permissions: Map<String, PermissionType> = mapOf(),
)

@Serializable
data class Topic(
    val id: Int,
    val title: String,
    val slug: String,
)

@Serializable
data class TopicList (
    val topics: List<Topic>,
    @SerialName("per_page")
    val perPage: Int,
)
@Serializable
data class CategoryDetails (
    @SerialName("topic_list")
    val topicList: TopicList
)

data class UdhDiscourseTenant(
    val name: String,
    val displayName: String?,
    val color: String?,
) {
    val categoryName: String get() = displayName ?: name
    val adminGroupName: String get() = "$name.admin" // "." is not allowed in tenant names, so there can't be collisions
    val memberGroupName: String get() = "$name.member"
    val adminGroupFullName: String? get() = displayName?.let { "$it Admin" }

    companion object {
        fun fromTenant(tenant: UdhTenant, resource: UdhResource<*>): UdhDiscourseTenant {
            val color = resource.customAttribute("color-primary")?.lowercase()?.takeIf(COLOR_RE::matches)
            return UdhDiscourseTenant(
                name = tenant.tenant,
                displayName = resource.customAttribute(UdhTenant.ATTR_DISPLAY_NAME),
                color = color
            )
        }
    }
}

fun getDiscourseClient(): DiscourseClient? {
    return DISCOURSE_HOST?.let {
        DiscourseClient(it, DISCOURSE_API_KEY!!, DISCOURSE_USERNAME!!)
    }
}

class DiscourseClient(val host: String, val apiKey: String, val username: String) {
    val httpClient: HttpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build()
    val json = Json {
        ignoreUnknownKeys = true
    }

    fun httpRequest(
        uri: String, allowedErrors: Set<Int> = emptySet(),
        builderConfig: (HttpRequest.Builder) -> HttpRequest.Builder,
    ): HttpResponse<String> {
        val response = httpClient.send(
            builderConfig(HttpRequest.newBuilder())
                .uri(URI(uri))
                // HTTP2 requests sometimes fail, so force HTTP 1.1
                .version(HttpClient.Version.HTTP_1_1)
                .header("Api-Key", apiKey)
                .header("Api-Username", username)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json").build(), BodyHandlers.ofString()
        )
        if (response.statusCode() >= 400 && !allowedErrors.contains(response.statusCode()))
            throw HttpException(response)
        return response
    }

    fun getGroupByName(name: String): DiscourseGroup? {
        val result = httpRequest("${host}/groups/${name}.json", allowedErrors = setOf(404)) { it.GET() }
        if (result.statusCode() == 404) {
            return null
        }
        return json.decodeFromString<DiscourseGroupResult>(result.body()).group
    }

    fun getCategoryBySlug(name: String): DiscourseCategory? {
        val result = httpRequest("${host}/c/${name}/find_by_slug.json", allowedErrors = setOf(404)) { it.GET() }
        if (result.statusCode() == 404) {
            return null
        }
        return json.decodeFromString<DiscourseCategoryResult>(result.body()).category
    }

    fun getSubcategories(categoryId: Int): List<DiscourseCategory> {
        @Serializable
        data class SubcategoryList(
            val categories: List<DiscourseCategory>
        )

        @Serializable
        data class SubcategoryResult(
            @SerialName("category_list")
            val categoryList: SubcategoryList,
        )

        val result = httpRequest("${host}/categories.json?parent_category_id=$categoryId") { it.GET() }
        return json.decodeFromString<SubcategoryResult>(result.body()).categoryList.categories

    }

    fun createGroup(group: DiscourseGroup): Int {
        @Serializable
        data class DiscourseCreateGroupResult(
            @SerialName("basic_group")
            val basicGroup: DiscourseGroup,
        )

        LOGGER.debug("creating $group")
        val body = json.encodeToString(DiscourseGroupResult(group))
        val result = httpRequest("${host}/admin/groups.json") {
            it.POST(BodyPublishers.ofString(body))
        }
        return json.decodeFromString<DiscourseCreateGroupResult>(result.body()).basicGroup.id
    }

    fun createCategory(category: DiscourseCategory): Int {
        LOGGER.debug("creating $category")
        val body = json.encodeToString(category)
        val result = httpRequest("${host}/categories.json") {
            it.POST(BodyPublishers.ofString(body))
        }
        return json.decodeFromString<DiscourseCategoryResult>(result.body()).category!!.id
    }

    fun updateCategory(category: DiscourseCategory): DiscourseCategory {
        LOGGER.debug("updating $category")
        val body = json.encodeToString(category)
        val result = httpRequest("${host}/categories/${category.id}.json") {
            it.PUT(BodyPublishers.ofString(body))
        }
        return json.decodeFromString<DiscourseCategoryResult>(result.body()).category!!
    }

    fun updateGroup(group: DiscourseGroup) {
        LOGGER.debug("updating $group")
        val body = json.encodeToString(DiscourseGroupResult(group, updateExistingUsers = "true"))
        httpRequest("${host}/groups/${group.id}.json") {
            it.PUT(BodyPublishers.ofString(body))
        }
    }

    fun upsertGroup(group: DiscourseGroup): Int {
        val existingGroup = getGroupByName(group.name)
        if (existingGroup != null) {
            updateGroup(group.copy(id = existingGroup.id))
            return existingGroup.id
        } else {
            return createGroup(group)
        }
    }

    fun upsertCategory(category: DiscourseCategory, parentSlug: String? = null): Int {
        val categorySlug = parentSlug?.let { "$it/${category.slug}" } ?: category.slug
        val existingCategory = getCategoryBySlug(categorySlug)
        if (existingCategory != null) {
            updateCategory(category.copy(id = existingCategory.id))
            return existingCategory.id
        } else {
            return createCategory(category)
        }
    }

    fun deleteGroup(groupId: Int) {
        LOGGER.debug("deleting group $groupId")
        httpRequest("${host}/admin/groups/${groupId}") { it.DELETE() }
    }

    fun deleteCategoryWithTopics(categoryId: Int) {
        LOGGER.debug("deleting category $categoryId")

        do {
            val result = httpRequest("${host}/c/${categoryId}.json")  { it.GET() }
            val category = json.decodeFromString<CategoryDetails>(result.body())
            category.topicList.topics.forEach { topic ->
                // ignore 422, that happens when trying to delete the discourse default category
                httpRequest("${host}/t/${topic.id}", setOf(422)) { it.DELETE() }
            }
        } while (category.topicList.topics.size >= category.topicList.perPage)


        httpRequest("${host}/categories/${categoryId}") { it.DELETE() }
    }

    fun findTopic(categorySlug: String, topicName: String): Topic? {
        var page = 0
        do {
            val result = httpRequest("${host}/c/${categorySlug}.json?page=${page}")  { it.GET() }
            val category = json.decodeFromString<CategoryDetails>(result.body())
            category.topicList.topics.forEach {
                if (it.title == topicName) {
                    return it
                }
            }

            page += 1
        } while (category.topicList.topics.size >= category.topicList.perPage)
        return null
    }

    fun upsertForTenant(tenant: UdhDiscourseTenant) {
        upsertGroup(
            DiscourseGroup(
                id = -1,
                name = tenant.memberGroupName,
                fullName = tenant.displayName,
                visibilityLevel = VisibilityLevel.STAFF,
                membersVisibilityLevel = VisibilityLevel.STAFF,
            )
        )
        val adminGroupId = upsertGroup(
            DiscourseGroup(
                id = -1,
                name = tenant.adminGroupName,
                fullName = tenant.adminGroupFullName,
                visibilityLevel = VisibilityLevel.STAFF,
                membersVisibilityLevel = VisibilityLevel.STAFF,
            )
        )
        val mainCategoryId = upsertCategory(
            DiscourseCategory(
                id = -1,
                slug = tenant.name,
                name = tenant.categoryName,
                color = tenant.color ?: "25AAE2", // light blue, discourse default category color
                textColor = "FFFFFF",
                permissions = mapOf(
                    tenant.memberGroupName to PermissionType.FULL
                ),
                moderatingGroupIds = listOf(adminGroupId),
            )
        )
        val cityToolCategoryId = upsertCategory(
                DiscourseCategory(
                    id = -1,
                    parentCategoryId = mainCategoryId,
                    slug = CITYTOOL_REQUEST_CATEGORY_SLUG,
                    name = "City Tools Anfragen",
                    color = tenant.color ?: "25AAE2", // light blue, discourse default category color
                    textColor = "FFFFFF",
                    permissions = mapOf(
                        tenant.memberGroupName to PermissionType.FULL
                    ),
                    moderatingGroupIds = listOf(adminGroupId),
                ),
            parentSlug = tenant.name
            )
        updateGroup(
            DiscourseGroup(
                id = adminGroupId,
                name = tenant.adminGroupName,
                fullName = tenant.adminGroupFullName,
                visibilityLevel = VisibilityLevel.STAFF,
                membersVisibilityLevel = VisibilityLevel.STAFF,
                watchingCategoryIds = listOf(cityToolCategoryId),
            )
        )
    }

    fun deleteForTenant(tenantName: String) {
        getCategoryBySlug(tenantName)?.let { category ->
            getSubcategories(category.id).forEach { deleteCategoryWithTopics(it.id) }
            deleteCategoryWithTopics(category.id)
        }
        getGroupByName("$tenantName.member")?.let { deleteGroup(it.id) }
        getGroupByName("$tenantName.admin")?.let { deleteGroup(it.id) }
    }

    fun getProfilePictureUrl(userId: String): String? {
        @Serializable
        data class DiscourseUserInfo(
            @SerialName("avatar_template")
            val avatarTemplate: String
        )

        @Serializable
        data class DiscourseUserResponse(
            val user: DiscourseUserInfo
        )

        val result =
            httpRequest("${host}/u/by-external/oauth2_basic/$userId.json", allowedErrors = setOf(404)) { it.GET() }
        if (result.statusCode() == 404) {
            return null
        }
        val user = json.decodeFromString<DiscourseUserResponse>(result.body())
        val imagePath = user.user.avatarTemplate.replace("{size}", "144")
        return "$host$imagePath"
    }
}
