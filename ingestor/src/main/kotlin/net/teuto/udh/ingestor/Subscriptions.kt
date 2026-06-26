package net.teuto.udh.ingestor

import com.fasterxml.jackson.databind.ObjectMapper
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.eclipse.paho.client.mqttv3.*
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.DisposableBean
import org.springframework.beans.factory.InitializingBean
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service
import java.net.SocketTimeoutException
import java.time.Instant
import java.util.UUID.randomUUID
import javax.net.ssl.SSLHandshakeException
import kotlin.text.Charsets.UTF_8

@Serializable
data class SubscriptionConfig(
    val uri: String, val topic: String, val format: String, val username: String, val password: String
) {
    override fun toString(): String {
        return "SubscriptionConfig(uri=$uri, topic=$topic, format=$format, username=$username, password=[redacted])"
    }
}

@Serializable
data class Subscription(val project: String, val name: String, val config: SubscriptionConfig) {
    val resourceApiKey: String = "$project.$name"

    fun reportConnecting() {
        synchronized(mqttStatus) {
            mqttStatus[resourceApiKey] = MqttStatus(MqttState.CONNECTING, null, null)
        }
    }

    fun reportErrorState(message: String) {
        synchronized(mqttStatus) {
            mqttStatus[resourceApiKey]?.let {
                it.state = MqttState.ERROR
                it.error = message
            }
        }
    }

    fun reportConnected() {
        synchronized(mqttStatus) {
            mqttStatus[resourceApiKey]?.let {
                it.state = MqttState.CONNECTED
                it.error = null
            }
        }
    }

    fun reportMessageArrived() {
        synchronized(mqttStatus) {
            mqttStatus[resourceApiKey]?.let {
                it.lastMessageTime = Instant.now().toString()
            }
        }
    }

    fun reportRemoval() {
        synchronized(mqttStatus) {
            mqttStatus.remove(resourceApiKey)
        }
    }
}

@Serializable
enum class MqttState {
    CONNECTING,
    CONNECTED,
    ERROR
}

@Serializable
data class MqttStatus(var state: MqttState, var error: String?, var lastMessageTime: String?)

val mqttStatus = mutableMapOf<String, MqttStatus>()

@ConfigurationProperties
@Component
class SubscriptionConfiguration(
    @Value("\${subscriptions:[]}") var subscriptions: String, val manager: SubscriptionManager
) : InitializingBean {
    override fun afterPropertiesSet() {
        manager.configure(Json.decodeFromString<Set<Subscription>>(subscriptions))
    }
}

@Service
class SubscriptionManager(val inputService: InputService) : DisposableBean {
    private var configToClient = mutableMapOf<Subscription, MqttAsyncClient>()
    private var logger: Logger = LoggerFactory.getLogger(SubscriptionManager::class.java)

    fun reportError(subscription: Subscription, cause: Throwable?) {
        logger.error("lost connection to $subscription", cause)
        val innerCause = if (cause is MqttException) {
            // see https://github.com/eclipse-paho/paho.mqtt.java/blob/9c742c1d83e71132452e08d325e5a90d1631c302/org.eclipse.paho.client.mqttv3/src/main/java/org/eclipse/paho/client/mqttv3/MqttException.java
            when(cause.reasonCode) {
                1 -> {
                    subscription.reportErrorState("Invalid MQTT protocol version")
                    return
                }
                2 -> {
                    subscription.reportErrorState("Invalid MQTT client id")
                    return
                }
                3 -> {
                    subscription.reportErrorState("Code broker unavailable")
                    return
                }
                4 -> {
                    subscription.reportErrorState("Authorization failed")
                    return
                }
                5 -> {
                    subscription.reportErrorState("Unauthorized")
                    return
                }
                32108 -> {
                    subscription.reportErrorState("MQTT Protocol Error")
                    return
                }
                32109 -> {
                    subscription.reportErrorState("Unexpectedly lost connection to server")
                    return
                }
                else -> cause.cause
            }

        } else {
            cause
        }
        when (innerCause) {
            is SSLHandshakeException -> subscription.reportErrorState("Invalid or expired SSL certificate")
            is SocketTimeoutException -> subscription.reportErrorState("Could not reach host due to timeout")
            else -> subscription.reportErrorState("Connection failed")
        }
    }

    @Synchronized
    fun configure(subscriptions: Set<Subscription>) {
        for ((config, client) in configToClient.filterKeys { !subscriptions.contains(it) }) {
            if (client.isConnected)
                client.disconnect()
            configToClient.remove(config)
            config.reportRemoval()
        }

        for (subscription in subscriptions.filter { !configToClient.containsKey(it) }) {
            subscription.reportConnecting()
            logger.info("processing $subscription")
            val client = try {
                val finalUri = subscription.config.uri
                    .replace(Regex("^mqtt://"), "tcp://")
                    .replace(Regex("^mqtts://"), "ssl://")
                MqttAsyncClient(finalUri, randomUUID().toString())
            } catch (e: IllegalArgumentException) {
                logger.error("failed to create client for $subscription", e)
                subscription.reportErrorState("URL invalid")
                continue;
            }

            client.setCallback(object : MqttCallbackExtended {
                override fun connectionLost(cause: Throwable?) {
                    reportError(subscription, cause)
                }

                override fun deliveryComplete(token: IMqttDeliveryToken?) {}

                override fun messageArrived(topic: String?, message: MqttMessage?) {
                    subscription.reportMessageArrived()
                    message?.payload?.let {
                        try {
                            when (subscription.config.format) {
                                "direct", "lorawan", "zenner" -> inputService.writeInput(
                                    "mqtt_${subscription.config.format}",
                                    subscription.project,
                                    ObjectMapper().readValue(it.toString(UTF_8), Map::class.java) as Map<String, Any?>
                                )
                            }
                        } catch (e: Exception) {
                            logger.error("error forwarding message to kafka", e)
                        }
                    }
                }

                override fun connectComplete(reconnect: Boolean, serverURI: String?) {
                    logger.debug("connected {}", subscription)
                    client.subscribe(subscription.config.topic, 0)
                    subscription.reportConnected()
                }
            })

            val options = MqttConnectOptions()
            options.isAutomaticReconnect = true
            options.userName = subscription.config.username
            options.password = subscription.config.password.toCharArray()

            try {
                client.connect(options, null, object : IMqttActionListener {
                    override fun onFailure(asyncActionToken: IMqttToken?, cause: Throwable?) {
                        reportError(subscription, cause)
                        client.reconnect()
                    }

                    override fun onSuccess(asyncActionToken: IMqttToken?) {
                        logger.debug("success connecting to {}", subscription)
                    }
                })
                configToClient[subscription] = client
            } catch (e: MqttException) {
                logger.error("failed to connect to $subscription", e)
                subscription.reportErrorState("Connection failed")
            }
        }
    }

    override fun destroy() {
        configToClient.values.forEach(MqttAsyncClient::disconnect)
    }
}