package net.teuto.udh

import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull


class DiscourseClientTest {

    @Test
    @Disabled
    fun getCategories() {
        val client = getDiscourseClient()!!

        val orgName = UUID.randomUUID().toString()
        val orgDisplayName = "Test $orgName"

        val udhTenant = UdhDiscourseTenant(
            name = orgName,
            displayName = orgDisplayName,
            color = "25AAE2"
        )

        client.upsertForTenant(udhTenant)

        val category = assertNotNull(client.getCategoryBySlug(orgName))
        assertEquals(orgName, category.slug)
        assertEquals(orgDisplayName, category.name)
        assertEquals("25AAE2", category.color)
        assertEquals(
            listOf(GroupPermission(permissionType = PermissionType.FULL, groupName = orgName)),
            category.groupPermissions
        )

        val memberGroup = assertNotNull(client.getGroupByName("$orgName.member"))
        assertEquals("$orgName.member", memberGroup.name)
        assertEquals(orgDisplayName, memberGroup.fullName)

        val adminGroup = assertNotNull(client.getGroupByName("$orgName.admin"))
        assertEquals("$orgName.admin", adminGroup.name)
        assertEquals("$orgDisplayName Admin", adminGroup.fullName)

        client.deleteForTenant(udhTenant.name)
    }
}