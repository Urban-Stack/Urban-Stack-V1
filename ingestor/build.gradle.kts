plugins {
    kotlin("jvm") version "2.4.0"
    kotlin("plugin.spring") version "2.4.0"
    id("org.springframework.boot") version "4.1.0"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.serialization") version "2.4.0"
}

kotlin {
    jvmToolchain(21)
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web:4.1.0")
    implementation("org.springframework.boot:spring-boot-starter-actuator:4.1.0")
    implementation("org.springframework.cloud:spring-cloud-starter-bootstrap:5.0.2")
    implementation("org.springframework.cloud:spring-cloud-starter-kubernetes-client-config:5.0.2")
    implementation("org.springframework.security:spring-security-oauth2-jose:7.1.0")
    implementation("org.apache.kafka:kafka-streams:4.3.1")
    implementation("org.jetbrains.kotlin:kotlin-reflect:2.4.0")
    implementation("org.springframework.boot:spring-boot-starter-kafka:4.1.0")
    implementation("org.eclipse.paho:org.eclipse.paho.client.mqttv3:1.2.5")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}
