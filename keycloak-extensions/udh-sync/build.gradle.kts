plugins {
    kotlin("jvm") version "2.3.21"
    kotlin("plugin.serialization") version "2.3.21"
}
val keycloakVersion = "26.1.5"

repositories {
    mavenCentral()
}

dependencies {
    compileOnly("org.keycloak:keycloak-core:$keycloakVersion")
    testImplementation("org.keycloak:keycloak-core:$keycloakVersion")
    compileOnly("org.keycloak:keycloak-services:$keycloakVersion")
    testImplementation("org.keycloak:keycloak-services:$keycloakVersion")
    compileOnly("org.keycloak:keycloak-server-spi:$keycloakVersion")
    compileOnly("org.keycloak:keycloak-server-spi-private:$keycloakVersion")
    compileOnly("org.keycloak:keycloak-model-jpa:$keycloakVersion")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
    implementation("io.github.reactivecircus.cache4k:cache4k:0.14.0")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
    implementation("aws.sdk.kotlin:s3:1.6.71")
    implementation("aws.sdk.kotlin:iam:1.6.71")

    // full dependencies destroy Keycloak
    implementation("io.kubernetes:client-java:24.0.0") { isTransitive = false }
    implementation("io.kubernetes:client-java-api:24.0.0") { isTransitive = false }
    implementation("com.squareup.okhttp3:okhttp:5.3.2")
    implementation("io.gsonfire:gson-fire:1.9.0")

    implementation("com.expediagroup:graphql-kotlin-schema-generator:8.9.0")
    implementation("com.expediagroup:graphql-kotlin-server:8.9.0")
    implementation("com.graphql-java:graphql-java-extended-scalars:24.0")

    implementation("com.clickhouse:clickhouse-jdbc:0.9.4:all")
}

tasks.test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(21)
}

tasks.register<Jar>("fatJar") {
    group = "build"
    description = "Creates a self contained fat JAR"
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    val dependencies = configurations.runtimeClasspath.get().map(::zipTree)
    from(dependencies)
    archiveAppendix = "all"
    with(tasks.jar.get())
}
