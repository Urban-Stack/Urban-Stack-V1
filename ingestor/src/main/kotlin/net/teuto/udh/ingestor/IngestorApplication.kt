package net.teuto.udh.ingestor

import org.apache.kafka.clients.admin.NewTopic
import org.apache.kafka.streams.KafkaStreams
import org.apache.kafka.streams.StreamsBuilder
import org.apache.kafka.streams.kstream.KStream
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.ApplicationContext
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod.POST
import org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE
import org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED
import org.springframework.http.ResponseEntity
import org.springframework.kafka.annotation.EnableKafkaStreams
import org.springframework.kafka.config.StreamsBuilderFactoryBean
import org.springframework.kafka.config.StreamsBuilderFactoryBeanConfigurer
import org.springframework.kafka.config.TopicBuilder
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.exchange
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.time.Instant.now


@SpringBootApplication
class IngestorApplication

fun main(args: Array<String>) {
    runApplication<IngestorApplication>(*args)
}

class AudienceValidator : OAuth2TokenValidator<Jwt> {
    var error: OAuth2Error = OAuth2Error("invalid_token", "The required audience is missing", null)
    override fun validate(jwt: Jwt): OAuth2TokenValidatorResult {
        return if (jwt.audience?.contains("ingestor") ?: false) {
            OAuth2TokenValidatorResult.success()
        } else {
            OAuth2TokenValidatorResult.failure(error)
        }
    }
}

@Service
class MqttReportPublishingService(
    @Value("\${KEYCLOAK_REALM_URL}/data-hub/_sensor-subscription-status") val apiUrl: String,
    @Value("\${CLIENT_SECRET}") val clientSecret: String,
    @Value("\${KEYCLOAK_REALM_URL}/protocol/openid-connect/token") val tokenUrl: String
) {
    fun getAccessToken(): String {
        val entity = HttpEntity(
            "grant_type=client_credentials",
            HttpHeaders().apply {
                setBasicAuth("ingestor", clientSecret)
                contentType = APPLICATION_FORM_URLENCODED
            })

        try {
            return RestTemplate().exchange<Map<String, Any>>(tokenUrl, POST, entity).body!!["access_token"]!!.toString()
        } catch (e: HttpClientErrorException) {
            throw ResponseStatusException(SERVICE_UNAVAILABLE)
        }
    }

    fun pushStatus() {
        val headers = HttpHeaders().apply { setBearerAuth(getAccessToken()) }

        val mqttStatusCopy = synchronized(mqttStatus) {
            mqttStatus.toMap()
        }
        RestTemplate().put(
            apiUrl,
            HttpEntity(mqttStatusCopy, headers)
        )
    }

}

@Configuration
@EnableScheduling
class MqttReporting(
    val reportingService: MqttReportPublishingService
) {

    @Scheduled(fixedDelay = 10_000, initialDelay = 7_000)
    fun reportMqttStates() {
        reportingService.pushStatus()
    }

}

@Configuration
class JwtDecoderConfig {
    @Bean
    fun jwtDecoder(@Value("\${OAUTH2_ISSUER}") issuer: String): NimbusJwtDecoder {
        val jwtDecoder = NimbusJwtDecoder.withIssuerLocation(issuer).build()
        val audienceValidator: OAuth2TokenValidator<Jwt> = AudienceValidator()
        val withIssuer: OAuth2TokenValidator<Jwt> = JwtValidators.createDefault()
        val withAudience: OAuth2TokenValidator<Jwt> = DelegatingOAuth2TokenValidator(withIssuer, audienceValidator)
        jwtDecoder.setJwtValidator(withAudience)
        return jwtDecoder
    }
}

@RestController
@RequestMapping("/api/v2/sensor/message")
class IngestorController(
    val inputService: InputService, private var jwtDecoder: NimbusJwtDecoder
) {
    fun getAccessToken(authHeader: String, tokenUrl: String): String {
        val headers = HttpHeaders()
        headers.add("Authorization", authHeader)
        headers.contentType = APPLICATION_FORM_URLENCODED
        val entity = HttpEntity(
            "grant_type=client_credentials", headers
        )

        val exchange =
            try {
                RestTemplate().exchange<Map<String, Any>>(tokenUrl, POST, entity)
            } catch (e: HttpClientErrorException) {
                throw ResponseStatusException(e.statusCode)
            }

        return exchange.body!!["access_token"]!!.toString()
    }

    fun determineProject(accessToken: String): String {
        var projects = jwtDecoder.decode(accessToken).claims["projects"]
        return (projects as List<*>)[0] as String
    }

    @PostMapping("direct")
    fun direct(
        @RequestBody body: Map<String, Any>,
        @RequestHeader("Authorization") authHeader: String,
        @Value("\${OAUTH2_ISSUER}/protocol/openid-connect/token") tokenUrl: String
    ): ResponseEntity<Void> {
        val token = getAccessToken(authHeader, tokenUrl)
        val project = determineProject(token)

        inputService.writeInput("http_direct", project, body)
        return ResponseEntity.noContent().build()
    }
}

@Service
class InputService(val kafkaTemplate: KafkaTemplate<String, Any>) {
    fun writeInput(format: String, project: String, body: Map<String, Any?>) {
        kafkaTemplate.send(
            "sensor_messages_input", mapOf(
                "type" to format,
                "project" to project,
                "time" to now().epochSecond,
                "data" to body,
            )
        )
    }
}

@Configuration
class KafkaTopics {
    @Bean
    fun inputTopic(kStreamBuilder: StreamsBuilder): NewTopic {
        return TopicBuilder.name("sensor_messages_input").partitions(12).build()
    }

    @Bean
    fun outputTopic(kStreamBuilder: StreamsBuilder): NewTopic {
        return TopicBuilder.name("sensor_messages").partitions(12).build()
    }
}

// Beep Base columns have the prefix "bp_"

val BEEPBASE_BOOLEAN_COLUMNS = setOf(
    "beep_base",
    "ds18b20_present",
    "fft_present",
    "weight_present",
)

val BEEPBASE_INTEGER_COLUMNS = setOf(
    "alarm",
    "bat_perc",
    "ds18b20_sensor_amount",
    "fft_bin_amount",
    "fft_hz_per_bin",
    "fft_start_bin",
    "fft_stop_bin",
    "s_bin_122_173",
    "s_bin_173_224",
    "s_bin_224_276",
    "s_bin_276_327",
    "s_bin_327_378",
    "s_bin_378_429",
    "s_bin_429_480",
    "s_bin_480_532",
    "s_bin_532_583",
    "s_bin_71_122",
    "w_v",
    "weight_sensor_amount",
)

val BEEPBASE_FLOAT_COLUMNS = setOf(
    "bv",
    "t_i",
)

val FLOAT_COLUMNS = setOf(
    "latitude",
    "longitude",
    "temperature_outside",
    "uv_index",
    "humidity_air",
    "air_pressure",
    "wind_speed",
    "wind_peak_gust",
    "wind_direction",
    "light_intensity",
    "rain_intensity",
    "rain_accumulated",
    "battery_voltage",
    "soil_moisture1",
    "soil_moisture2",
    "soil_moisture3",
    "soil_moisture4",
    "soil_water_column1",
    "soil_water_column2",
    "soil_water_column3",
    "soil_water_column4",
    "soil_water_tension1",
    "soil_water_tension2",
    "soil_water_tension3",
    "soil_water_tension4",
    "soil_temperature1",
    "soil_temperature2",
    "soil_temperature3",
    "soil_temperature4",
    "pm2_5",
    "pm10",
    "distance",
    "pedestrian_traffic_h",
    "lux",
    "co2",
    "temperature_inside",
    "battery_level",
) + BEEPBASE_FLOAT_COLUMNS.map { "bp_$it" }

val INTEGER_COLUMNS = BEEPBASE_INTEGER_COLUMNS.map { "bp_$it" }

val COMMON_FLOAT_MAPPING = mapOf(
    "co2_1" to "co2",
    "battery_1" to "battery_voltage",
    "humidity_1" to "humidity_air",
    "temperature_1" to "temperature_inside",
    "previous_state_duration" to "previous_state_duration_parking",
    "previous_state_duration_error" to "previous_state_duration_error_parking",
) + BEEPBASE_FLOAT_COLUMNS.associateWith { "bp_$it" }

val COMMON_INTEGER_MAPPING = BEEPBASE_INTEGER_COLUMNS.associateWith { "bp_$it" }

val BOOLEAN_COLUMNS = setOf("previous_state_duration_overflow_parking") + BEEPBASE_BOOLEAN_COLUMNS.map { "bp_$it" }

val COMMON_BOOLEAN_MAPPING = mapOf(
    "previous_state_duration_overflow" to "previous_state_duration_overflow_parking"
) + BEEPBASE_BOOLEAN_COLUMNS.associateWith { "bp_$it" }

val STRING_COLUMNS = setOf("sensor_id")

fun mergeNullableMaps(maps: List<Map<String, Any?>>): Map<String, Any?> {
    return maps.reduce { acc, map ->
        (acc.filterValues { it != null } + map.filterValues { it != null })
    }.filterValues { it != null }
}

@Configuration
@EnableKafkaStreams
class KafkaStreamsConfig(topics: KafkaTopics) {
    @Bean
    fun configurer(context: ApplicationContext): StreamsBuilderFactoryBeanConfigurer {
        return StreamsBuilderFactoryBeanConfigurer { fb: StreamsBuilderFactoryBean ->
            fb.setStateListener { newState: KafkaStreams.State, oldState: KafkaStreams.State ->
                if (newState == KafkaStreams.State.ERROR) SpringApplication.exit(context, { 13 })
            }
        }
    }

    @Bean
    fun kStream(kStreamBuilder: StreamsBuilder): KStream<String, Map<String, Any>>? {
        val stream = kStreamBuilder.stream<String, Map<String, Any>>("sensor_messages_input")

        val fallbackHeuristic: (Map<*, *>) -> Map<String, Any?> = { payload ->
            payload.map { (k, v) ->
                if (k == "status") {
                    // status can both be a string or a boolean that gets mapped to "status_parking"
                    (v as? Boolean)?.let { "status_parking" to it } ?: ("status" to (v as? String ?: (v as? Number)?.toString()))
                } else if (FLOAT_COLUMNS.contains(k)) {
                    (k as String) to (v as? Number)
                } else if (INTEGER_COLUMNS.contains(k)) {
                    (k as String) to (v as? Number)?.toLong()
                } else if (BOOLEAN_COLUMNS.contains(k)) {
                    (k as String) to (v as? Boolean)
                } else if (STRING_COLUMNS.contains(k)) {
                    (k as String) to (v as? String ?: (v as? Number)?.toString())
                } else if (COMMON_FLOAT_MAPPING.containsKey(k)) {
                    (COMMON_FLOAT_MAPPING[k] as String) to (v as? Number)
                } else if (COMMON_INTEGER_MAPPING.containsKey(k)) {
                    (COMMON_INTEGER_MAPPING[k] as String) to (v as? Number)?.toLong()
                } else if (COMMON_BOOLEAN_MAPPING.containsKey(k)) {
                    (COMMON_BOOLEAN_MAPPING[k] as String) to (v as? Boolean)
                } else {
                    (k as String) to null
                }
            }.toMap()
        }

        stream.mapValues { msg ->
            val data = msg["data"] as Map<*, *>
            val type = msg["type"]
            when (type) {
                "http_direct", "mqtt_direct" -> mergeNullableMaps(listOf(
                    fallbackHeuristic(data),
                    mapOf(
                        "time" to ((data["time"] as? Number) ?: (msg["time"] as? Number) ?: now().epochSecond).toLong(),
                        "project" to msg["project"]!!,
                    )
                ))

                "mqtt_lorawan" -> {
                    val payloadHeuristic: (Map<*, *>) -> Map<String, Any?> = { payload ->
                        mergeNullableMaps(listOf(
                            fallbackHeuristic(payload),
                            mapOf(
                                "air_pressure" to (payload["AirPressure"] as? Number),
                                "battery_voltage" to (payload["BatteryLevel"] as? Number),
                                "humidity_air" to (payload["Humidity"] as? Number),
                                "status" to ((payload["Status"] as? Number)?.toString()
                                    ?: (payload["Status"] as? String)),
                                "temperature_outside" to (payload["Temperature"] as? Number)?.toFloat()
                            )
                        ))
                    }
                    (mapOf(
                        "time" to ((((data["uplink_message"] as? Map<*, *>)?.get("decoded_payload") as? Map<*, *>)?.get(
                            "timestamp"
                        ) as? Number)
                            ?: (msg["time"] as? Number) ?: now().epochSecond).toLong(),
                        "project" to msg["project"]!!,
                        "sensor_id" to (data["end_device_ids"] as? Map<*, *>)?.get("dev_eui") as? String,
                        "latitude" to (((data["uplink_message"] as? Map<*, *>)?.get("locations") as? Map<*, *>)?.get("user") as? Map<*, *>)?.get(
                            "latitude"
                        ) as? Number,
                        "longitude" to (((data["uplink_message"] as? Map<*, *>)?.get("locations") as? Map<*, *>)?.get("user") as? Map<*, *>)?.get(
                            "longitude"
                        ) as? Number,
                    ) + (((data["uplink_message"] as? Map<*, *>)?.get("decoded_payload") as? Map<*, *>)?.let(
                        payloadHeuristic
                    ) ?: emptyMap())).filterValues { it != null }
                }

                "mqtt_zenner" -> {
                    val payloadHeuristic: (Map<*, *>) -> Map<String, Any?> = { payload ->
                        mergeNullableMaps(listOf(
                            fallbackHeuristic(payload),
                            payload.map { (k, v) ->
                                when (k as String) {
                                    "lat" -> "latitude" to v as? Number
                                    "lon" -> "longitude" to v as? Number
                                    "uv" -> "uv_index" to v as? Number
                                    "humidity", "relative_humidity" -> "humidity_air" to v as? Number
                                    "temperature" -> "temperature_outside" to v as? Number
                                    "peak_wind_gust" -> "wind_peak_gust" to v as? Number
                                    "rainfall_intensity" -> "rain_intensity" to v as? Number
                                    "barometric_pressure" -> "air_pressure" to (v as? Number)?.let { it.toDouble() / 10 }
                                    "cumulative_rainfall" -> "rain_accumulated" to v as? Number
                                    "battery_level" -> "battery_voltage" to v as? Number
                                    "status" -> "status" to v as? String
                                    "moisturePercent1" -> "soil_moisture1" to v as? Number
                                    "moisturePercent2" -> "soil_moisture2" to v as? Number
                                    "moisturePercent3" -> "soil_moisture3" to v as? Number
                                    "moisturePercent4" -> "soil_moisture4" to v as? Number
                                    "soilWaterColumn_dm1" -> "soil_water_column1" to v as? Number
                                    "soilWaterColumn_dm2" -> "soil_water_column2" to v as? Number
                                    "soilWaterColumn_dm3" -> "soil_water_column3" to v as? Number
                                    "soilWaterColumn_dm4" -> "soil_water_column4" to v as? Number
                                    "soilWaterTension_pF1" -> "soil_water_tension1" to v as? Number
                                    "soilWaterTension_pF2" -> "soil_water_tension2" to v as? Number
                                    "soilWaterTension_pF3" -> "soil_water_tension3" to v as? Number
                                    "soilWaterTension_pF4" -> "soil_water_tension4" to v as? Number
                                    "temperature_celsius1" -> "soil_temperature1" to v as? Number
                                    "temperature_celsius2" -> "soil_temperature2" to v as? Number
                                    "temperature_celsius3" -> "soil_temperature3" to v as? Number
                                    "temperature_celsius4" -> "soil_temperature4" to v as? Number
                                    "wind_speed", "wind_direction", "light_intensity", "air_pressure" -> k to v as? Number
                                    else -> k to null
                                }
                            }.toMap()
                        ))
                    }

                    (mapOf(
                        "time" to (((data["measured_at"] as? String)?.let { Instant.parse(it).epochSecond } as? Number)
                            ?: (msg["time"] as? Number) ?: now().epochSecond).toLong(),
                        "project" to msg["project"]!!,
                        "sensor_id" to data["device_id"] as? String,
                    ) + ((data["data"] as? Map<*, *>)?.let(
                        payloadHeuristic
                    ) ?: emptyMap())).filterValues { it != null }
                }

                else -> mapOf(
                    "time" to ((data["time"] as? Number) ?: (msg["time"] as? Number) ?: now().epochSecond).toLong(),
                    "project" to msg["project"]!!
                )
            }
        }.to("sensor_messages")

        return stream
    }
}
