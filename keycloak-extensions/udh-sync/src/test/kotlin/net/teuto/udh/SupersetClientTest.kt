package net.teuto.udh

import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import java.util.*

class SupersetClientTest {

    @Test
    @Disabled
    fun createDeleteDashboard() {
        val client = getSupersetClient()!!

        val orgName = UUID.randomUUID().toString()
        client.createDashboard(orgName, orgName)
        val dashboardId = client.getDashboardBySlug(orgName)
        client.deleteDashboard(dashboardId!!)
    }
}