plugins {
    kotlin("jvm") version "2.3.21"
    kotlin("plugin.spring") version "2.3.21"
    id("org.springframework.boot") version "3.5.14"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.serialization") version "2.3.21"
}

kotlin {
    jvmToolchain(21)
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web:3.5.14")
    implementation("org.springframework.boot:spring-boot-starter-actuator:3.5.14")
    implementation("org.springframework.cloud:spring-cloud-starter-bootstrap:4.3.2")
    implementation("org.springframework.cloud:spring-cloud-starter-kubernetes-client-config:3.3.2")
    implementation("org.springframework.security:spring-security-oauth2-jose:6.5.10")
    implementation("org.apache.kafka:kafka-streams:3.9.2")
    implementation("org.jetbrains.kotlin:kotlin-reflect:2.3.21")
    implementation("org.springframework.kafka:spring-kafka:4.0.5")
    implementation("org.eclipse.paho:org.eclipse.paho.client.mqttv3:1.2.5")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}
