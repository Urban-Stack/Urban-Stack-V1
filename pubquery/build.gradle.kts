plugins {
    kotlin("jvm") version "2.4.0"
    kotlin("plugin.spring") version "2.4.0"
    id("org.springframework.boot") version "3.5.16"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.serialization") version "2.4.0"
}

kotlin {
    jvmToolchain(21)
}

repositories {
    maven("https://repo.osgeo.org/repository/release/")
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web:3.5.16")
    implementation("org.springframework.boot:spring-boot-starter-actuator:3.5.16")
    implementation("org.springframework.cloud:spring-cloud-starter-bootstrap:4.3.3")
    implementation("org.jetbrains.kotlin:kotlin-reflect:2.4.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
    implementation("com.clickhouse:client-v2:0.9.8")
    implementation("org.geotools:gt-geojson:34.4")
    implementation("com.github.ben-manes.caffeine:caffeine:3.2.4")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
