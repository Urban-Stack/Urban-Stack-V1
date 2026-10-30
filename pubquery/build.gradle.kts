plugins {
    kotlin("jvm") version "2.4.21"
    kotlin("plugin.spring") version "2.4.21"
    id("org.springframework.boot") version "4.1.2"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.serialization") version "2.4.21"
}

kotlin {
    jvmToolchain(21)
}

repositories {
    maven("https://repo.osgeo.org/repository/release/")
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web:4.1.2")
    implementation("org.springframework.boot:spring-boot-starter-actuator:4.1.2")
    implementation("org.springframework.cloud:spring-cloud-starter-bootstrap:5.0.4")
    implementation("org.jetbrains.kotlin:kotlin-reflect:2.4.21")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.12.0")
    implementation("com.clickhouse:client-v2:0.11.0")
    implementation("org.geotools:gt-geojson:35.2")
    implementation("com.github.ben-manes.caffeine:caffeine:3.3.1")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
