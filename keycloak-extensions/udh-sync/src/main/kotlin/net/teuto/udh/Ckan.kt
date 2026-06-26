package net.teuto.udh

import kotlinx.serialization.json.Json
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpRequest.BodyPublishers
import java.net.http.HttpResponse
import java.net.http.HttpResponse.BodyHandlers

// if the host is not set, this module does nothing
val CKAN_HOST: String? = System.getenv("CKAN_HOST")
val CKAN_API_TOKEN: String? = System.getenv("CKAN_API_TOKEN")

fun getCkanClient(): CkanClient? {
    return CKAN_HOST?.let {
        CkanClient(it, CKAN_API_TOKEN!!)
    }
}

fun createCkanOrg(tenant: String, displayName: String, imageUrl: String?) {
    val client = getCkanClient() ?: return
    client.createOrUpdateOrg(hashStringToUUID(tenant), tenant, displayName, imageUrl)
}

fun deleteCkanOrg(tenant: String) {
    val client = getCkanClient() ?: return
    client.deleteOrg(hashStringToUUID(tenant))
}

class CkanClient(val host: String, val token: String) {
    val httpClient = HttpClient.newHttpClient()
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
                .header("Authorization", token)
                .header("Content-Type", "application/json").build(), BodyHandlers.ofString()
        )
        if (response.statusCode() >= 400 && !allowedErrors.contains(response.statusCode()))
            throw HttpException(response)
        return response
    }

    fun deleteOrg(id: String) {
        val body = json.encodeToString(
            mapOf(
                "id" to id,
            )
        )
        // CKAN responds with HTTP 404 when the org is not found.
        // This can occur if the org is already deleted
        httpRequest("$host/api/3/action/organization_purge", setOf(404)) { it.POST(BodyPublishers.ofString(body)) }
    }

    /// Returns if the operation was successful, returns false if the org already existed
    fun createOrg(id: String, name: String, title: String, imageUrl: String?): Boolean {
        val body = json.encodeToString(
            mapOf(
                "id" to id,
                "name" to name,
                "title" to title,
                "image_url" to imageUrl,
            )
        )

        // ignore if the org already exists
        val response = httpRequest("$host/api/3/action/organization_create", setOf(409)) { it.POST(BodyPublishers.ofString(body)) }
        return response.statusCode() != 409
    }

    fun updateOrg(id: String, name: String, title: String, imageUrl: String?) {
        val body = json.encodeToString(
            mapOf(
                "id" to id,
                "name" to name,
                "title" to title,
                "image_url" to imageUrl,
            )
        )

        // ignore if the org already exists
        httpRequest("$host/api/3/action/organization_patch") { it.POST(BodyPublishers.ofString(body)) }
    }

    fun createOrUpdateOrg(id: String, name: String, title: String, imageUrl: String?) {
        if (!createOrg(id, name, title, imageUrl)) {
            updateOrg(id, name, title, imageUrl)
        }
    }
}