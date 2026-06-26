package net.teuto.udh.pubquery

import com.clickhouse.client.api.Client.Builder
import com.clickhouse.client.api.ClientException
import com.clickhouse.client.api.ServerException
import com.clickhouse.client.api.query.GenericRecord
import com.clickhouse.client.api.query.QuerySettings
import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.ser.std.StdSerializer
import com.github.benmanes.caffeine.cache.Caffeine
import org.geotools.geojson.geom.GeometryJSON
import org.geotools.geometry.jts.JTSFactoryFinder
import org.geotools.geometry.jts.WKTReader2
import org.locationtech.jts.geom.Geometry
import org.locationtech.jts.io.ParseException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpHeaders.CONTENT_TYPE
import org.springframework.http.HttpMethod
import org.springframework.http.HttpMethod.POST
import org.springframework.http.HttpStatus.*
import org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED
import org.springframework.http.MediaType.APPLICATION_JSON_VALUE
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.exchange
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.util.UriComponentsBuilder
import java.time.Duration


@SpringBootApplication
class PublishedQueryApplication

fun main(args: Array<String>) {
    runApplication<PublishedQueryApplication>(*args)
}

val geometryObjectMapper: ObjectMapper = ObjectMapper().registerModules(
    SimpleModule().addSerializer(
        Geometry::class.java, object : StdSerializer<Geometry>(Geometry::class.java) {
            override fun serialize(value: Geometry, jgen: JsonGenerator, provider: SerializerProvider) =
                jgen.writeRawValue(GeometryJSON().toString(value))
        })
)

fun resultsToFeatureCollection(results: List<GenericRecord>): String {
    val bodyObject = mapOf(
        "type" to "FeatureCollection",
        "features" to results.map { result ->
            val geometryValue = result.values.remove("geometry")
            if (geometryValue !is String) throw ResponseStatusException(BAD_GATEWAY)
            val geometry = try {
                WKTReader2(JTSFactoryFinder.getGeometryFactory()).read(geometryValue)
            } catch (_: ParseException) {
                throw ResponseStatusException(BAD_GATEWAY)
            }

            mapOf(
                "type" to "Feature",
                "geometry" to geometry,
                "properties" to result.values.filterValues { it is String || it is Number })
        })

    return geometryObjectMapper.writeValueAsString(bodyObject)
}

data class PublishedQueryRequest(val tenant: String, val vizGroup: String, val query: String)

@Service
class QueryResourceService(
    @Value("\${KEYCLOAK_REALM_URL}/data-hub/_published-query") val apiUrl: String,
    @Value("\${CLIENT_SECRET}") val clientSecret: String,
    @Value("\${KEYCLOAK_REALM_URL}/protocol/openid-connect/token") val tokenUrl: String
) {
    fun getAccessToken(): String {
        val entity = HttpEntity(
            "grant_type=client_credentials",
            HttpHeaders().apply {
                setBasicAuth("pubquery", clientSecret)
                contentType = APPLICATION_FORM_URLENCODED
            })

        try {
            return RestTemplate().exchange<Map<String, Any>>(tokenUrl, POST, entity).body!!["access_token"]!!.toString()
        } catch (e: HttpClientErrorException) {
            throw ResponseStatusException(SERVICE_UNAVAILABLE)
        }
    }

    fun retrievePublishedQuery(tenant: String, vizGroup: String, query: String): PublishedQueryResponse {
        val headers = HttpHeaders().apply { setBearerAuth(getAccessToken()) }

        try {
            return RestTemplate().exchange(
                UriComponentsBuilder.fromUriString(apiUrl).pathSegment(tenant, vizGroup, query).build().toUri(),
                HttpMethod.GET,
                HttpEntity<String>(headers),
                PublishedQueryResponse::class.java
            ).body!!
        } catch (e: HttpClientErrorException) {
            if (e.statusCode.isSameCodeAs(NOT_FOUND)) throw ResponseStatusException(NOT_FOUND)
            else throw ResponseStatusException(SERVICE_UNAVAILABLE)
        }
    }

    val cache = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(Duration.ofMinutes(3))
        .refreshAfterWrite(Duration.ofSeconds(30))
        .build { r: PublishedQueryRequest -> retrievePublishedQuery(r.tenant, r.vizGroup, r.query) }

    fun retrievePublishedQueryCached(r: PublishedQueryRequest): PublishedQueryResponse {
        return cache.get(r)
    }
}

data class PublishedQueryResponse(val query: String, val projects: List<String>)

@RestController
@RequestMapping("/api/v2/query")
class QueryController(val qrs: QueryResourceService) {
    var logger: Logger = LoggerFactory.getLogger(QueryController::class.java)

    @GetMapping("{tenant}/{vizGroup}/{query}/geojson")
    fun geojson(
        @PathVariable("tenant") tenant: String,
        @PathVariable("vizGroup") vizGroup: String,
        @PathVariable("query") query: String,
    ): ResponseEntity<String> {
        val publishedQuery = qrs.retrievePublishedQueryCached(PublishedQueryRequest(tenant, vizGroup, query))
        val results = try {
            Builder().addEndpoint("http://${System.getenv("CLICKHOUSE_HOST")}:8123/")
                .setUsername(System.getenv("CLICKHOUSE_USERNAME")).setPassword(System.getenv("CLICKHOUSE_PASSWORD"))
                .build().use { client ->
                    client.queryAll(
                        publishedQuery.query,
                        QuerySettings()
                            .serverSetting("SQL_projects", publishedQuery.projects.joinToString(" ")) // RLS context
                            .serverSetting("readonly", "1") // prevent setting changes and data modification
                            .serverSetting("max_result_rows", "10000") // too many rows
                            .serverSetting("max_result_bytes", "1000000") // bytes => big rows
                            .serverSetting("max_execution_time", "10") // seconds => expensive queries
                            .serverSetting(
                                "timeout_before_checking_execution_speed", "1"
                            ) // actually wait for expensive queries, don't cancel based on in-progress estimate
                    )
                }
        } catch (e: Exception) {
            when (e) {
                is ServerException, is ClientException -> {
                    logger.warn("Query execution error", e)
                    throw ResponseStatusException(BAD_GATEWAY)
                }
            }
            throw ResponseStatusException(BAD_GATEWAY)
        }
        return ResponseEntity.status(OK).header(CONTENT_TYPE, APPLICATION_JSON_VALUE)
            .body(resultsToFeatureCollection(results))
    }
}