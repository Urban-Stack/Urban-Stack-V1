package net.teuto.udh

import com.fasterxml.jackson.databind.ObjectMapper
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.net.CookieManager
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpRequest.BodyPublishers
import java.net.http.HttpResponse
import java.net.http.HttpResponse.BodyHandlers

// if the host is not set, this module does nothing
val SUPERSET_HOST: String? = System.getenv("SUPERSET_HOST")
val SUPERSET_ADMIN_USER = System.getenv("SUPERSET_USER") ?: "admin"
val SUPERSET_ADMIN_PASSWORD = System.getenv("SUPERSET_PASSWORD") ?: "admin"

fun getSupersetClient(): SupersetClient? {
    if (SUPERSET_HOST != null) {
        return SupersetClient("http://$SUPERSET_HOST", SUPERSET_ADMIN_USER, SUPERSET_ADMIN_PASSWORD)
    }
    return null
}

fun createSupersetDashboard(dashboard: UdhDashboard) {
    val client = getSupersetClient() ?: return
    client.createDashboard(dashboard.dashboardSlug, dashboard.dashboardSlug)
}

fun createSupersetDashboardWithTitle(slug: String, title: String) {
    val client = getSupersetClient() ?: return
    client.createDashboard(slug, title)
}

fun deleteSupersetDashboard(dashboard: UdhDashboard) {
    val client = getSupersetClient() ?: return
    val dashboardId = client.getDashboardBySlug(dashboard.dashboardSlug)
    LOGGER.info("deleting dashboard $dashboardId ${dashboard.dashboardSlug}")
    dashboardId?.let { client.deleteDashboard(it) }
}

fun createSupersetDatabase(project: UdhProject) {
    getSupersetClient()?.createDatabase(project)
}

fun deleteSupersetDatabase(project: UdhProject) {
    getSupersetClient()?.deleteDatabase(project)
}

fun hasSupersetDataset(dataset: UdhDataset): Boolean? {
    return getSupersetClient()?.hasDataset(dataset)
}

fun prepareSupersetDataset(dataset: UdhDataset, datasetConfig: UdhDataset.DatasetConfig) {
    getSupersetClient()?.prepareDataset(dataset, datasetConfig)
}

fun finalizeSupersetDataset(dataset: UdhDataset) {
    getSupersetClient()?.finalizeDataset(dataset)
}

fun deleteSupersetDataset(dataset: UdhDataset) {
    getSupersetClient()?.deleteDataset(dataset.flatName)
}

fun refreshSupersetDataset(dataset: UdhDataset) {
    getSupersetClient()?.refreshDataset(dataset)
}

@Serializable
data class GetDashboardResponse(val result: GetDashboardResponseInner)

@Serializable
data class GetDashboardResponseInner(val id: Int)

@Serializable
data class AuthResponse(@SerialName("access_token") val accessToken: String)

@Serializable
data class AuthRequest(var username: String, var password: String, var provider: String)

@Serializable
data class CSRFResponse(val result: String)

class SupersetClient(val host: String, val user: String, val password: String) {
    val httpClient = HttpClient.newBuilder().cookieHandler(CookieManager()).build()
    val json = Json {
        ignoreUnknownKeys = true
    }

    fun httpRequest(
        uri: String, allowedErrors: Set<Int> = emptySet(),
        builderConfig: (HttpRequest.Builder) -> HttpRequest.Builder,
    ): HttpResponse<String> {
        val authBody = json.encodeToString(
            AuthRequest(
                username = user,
                password = password,
                provider = "db"
            )
        )
        val authResponse = httpClient.send(
            HttpRequest.newBuilder(URI("$host/api/v1/security/login"))
                .header("Content-Type", "application/json")
                .POST(BodyPublishers.ofString(authBody)).build(), BodyHandlers.ofString()
        )
        if (authResponse.statusCode() >= 400)
            throw HttpException(authResponse)

        val accessToken = json.decodeFromString<AuthResponse>(authResponse.body()).accessToken

        val csrfResponse = httpClient.send(
            HttpRequest.newBuilder(URI("$host/api/v1/security/csrf_token/"))
                .header("Authorization", "Bearer $accessToken")
                .build(), BodyHandlers.ofString()
        )
        if (csrfResponse.statusCode() >= 400)
            throw HttpException(csrfResponse)
        val csrfToken = json.decodeFromString<CSRFResponse>(csrfResponse.body()).result

        val response = httpClient.send(
            builderConfig(HttpRequest.newBuilder())
                .uri(URI(uri))
                .header("Authorization", "Bearer $accessToken")
                .header("X-CSRFToken", csrfToken)
                .header("Content-Type", "application/json").build(), BodyHandlers.ofString()
        )
        if (response.statusCode() >= 400 && !allowedErrors.contains(response.statusCode()))
            throw HttpException(response)
        return response
    }

    fun getDashboardBySlug(slug: String): Int? {
        val response = httpRequest("$host/api/v1/dashboard/$slug", allowedErrors = setOf(404)) { it.GET() }
        if (response.statusCode() == 404) {
            return null
        }
        return json.decodeFromString<GetDashboardResponse>(response.body()).result.id
    }

    fun deleteDashboard(id: Int) {
        httpRequest("$host/api/v1/dashboard/$id") { it.DELETE() }
    }

    fun createDashboard(slug: String, title: String) {
        val body = json.encodeToString(
            mapOf(
                "dashboard_title" to title,
                "slug" to slug
            )
        )
        // Superset responds with HTTP 422 when the slug is not unique.
        // Since this can not occur otherwise, we assume a pre-imported dashboard
        // and continue without error.
        httpRequest("$host/api/v1/dashboard/", setOf(422)) { it.POST(BodyPublishers.ofString(body)) }
    }

    fun deleteDatabase(project: UdhProject) {
        val id = getDatabaseID(project)
        if (id == null) {
            LOGGER.warn("tried to delete database for ${project.flatName}, but it doesn't exist!")
            return
        }
        httpRequest("$host/api/v1/database/$id") { it.DELETE() }
    }

    private fun getDatabaseID(project: UdhProject): Long? {
        @Serializable
        data class DBResult(val id: Long)

        @Serializable
        data class GetDBResponse(val result: List<DBResult>)

        val id = json.decodeFromString<GetDBResponse>(
            httpRequest(
                "$host/api/v1/database/?q=(filters:!((col:database_name,opr:eq,value:${project.flatName})))",
                builderConfig = HttpRequest.Builder::GET
            ).body()
        ).result.singleOrNull()?.id
        return id
    }

    fun createDatabase(project: UdhProject) {
        val name = project.flatName

        val body = ObjectMapper().writeValueAsString(
            mapOf(
                "database_name" to name,
                "sqlalchemy_uri" to "clickhousedb://$name:$CLICKHOUSE_PASSWORD_QUERYONLY@$CLICKHOUSE_HOST",
                "expose_in_sqllab" to true,
                "allow_run_async" to false,
                "allow_ctas" to false,
                "allow_cvas" to false,
                "allow_dml" to false,
                "allow_file_upload" to false,
                "extra" to "{\"allows_virtual_table_explore\":false}",
            )
        )
        // Superset responds with HTTP 422 when the database already exists, including during repair
        httpRequest("$host/api/v1/database/", setOf(422)) { it.POST(BodyPublishers.ofString(body)) }
    }

    fun deleteDataset(datasetName: String) {
        val id = getDatasetID(datasetName)
        if (id == null) {
            LOGGER.warn("dataset $datasetName wasn't deleted because it doesn't exist!")
            return
        }
        httpRequest("$host/api/v1/dataset/$id") { it.DELETE() }
    }

    fun hasDataset(dataset: UdhDataset): Boolean {
        return getDatasetID(dataset.flatName) != null
    }

    fun prepareDataset(dataset: UdhDataset, datasetConfig: UdhDataset.DatasetConfig) {
        val temporaryName = ".${dataset.flatName}"

        fun escapedStringLiteral(s: String): String {
            return "'${s.replace("'", "''")}'"
        }

        val body = ObjectMapper().writeValueAsString(
            mapOf(
                "database" to getDatabaseID(dataset.projectModel)!!,
                "table_name" to temporaryName,
                "sql" to "SELECT * FROM s3(`${dataset.projectModel.flatName}`," +
                        "filename=${escapedStringLiteral(datasetConfig.path)}," +
                        "format=${escapedStringLiteral(datasetConfig.format.name)})",
            )
        )

        fun create() {
            httpRequest("$host/api/v1/dataset/") { it.POST(BodyPublishers.ofString(body)) }
        }

        try {
            create()
        } catch (e: HttpException) {
            // Superset responds with HTTP 422 when temporary name is in use
            if (e.response.statusCode() == 422) {
                deleteDataset(temporaryName)
                create()
            } else
                throw e
        }
    }

    fun finalizeDataset(dataset: UdhDataset) {
        val temporaryId = getDatasetID(".${dataset.flatName}")!!

        val body = ObjectMapper().writeValueAsString(
            mapOf(
                "base_model_id" to temporaryId,
                "table_name" to dataset.flatName,
            )
        )
        httpRequest("$host/api/v1/dataset/duplicate") { it.POST(BodyPublishers.ofString(body)) }
        httpRequest("$host/api/v1/dataset/$temporaryId") { it.DELETE() }
    }

    fun refreshDataset(dataset: UdhDataset) {
        val id = getDatasetID(dataset.flatName)!!
        httpRequest("$host/api/v1/dataset/$id/refresh") { it.PUT(BodyPublishers.noBody()) }
    }

    private fun getDatasetID(tableName: String): Long? {
        @Serializable
        data class DSResult(val id: Long)

        @Serializable
        data class GetDSResponse(val result: List<DSResult>)

        val id = json.decodeFromString<GetDSResponse>(
            httpRequest(
                "$host/api/v1/dataset/?q=(filters:!((col:table_name,opr:eq,value:$tableName)))",
                builderConfig = HttpRequest.Builder::GET
            ).body()
        ).result.singleOrNull()?.id
        return id
    }
}
