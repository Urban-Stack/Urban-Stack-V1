package net.teuto.udh

import aws.sdk.kotlin.services.iam.model.AccessKey
import com.clickhouse.client.api.query.QuerySettings
import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet
import java.util.UUID

val CLICKHOUSE_HOST = System.getenv("CLICKHOUSE_HOST")
val CLICKHOUSE_USERNAME = System.getenv("CLICKHOUSE_USERNAME")
val CLICKHOUSE_PASSWORD = System.getenv("CLICKHOUSE_PASSWORD")
val CLICKHOUSE_PASSWORD_QUERYONLY = System.getenv("CLICKHOUSE_PASSWORD_QUERYONLY")

fun createConnection(): Connection? = DriverManager.getConnection(
    "jdbc:ch://$CLICKHOUSE_HOST:8123/",
    CLICKHOUSE_USERNAME,
    CLICKHOUSE_PASSWORD
)

fun runStatementClickHouse(statement: String, params: List<Any> = emptyList()) {
    createConnection()?.use { connection ->
        connection.prepareStatement(statement).use { stmt ->
            params.withIndex().forEach() {
                stmt.setObject(it.index + 1, it.value)
            }
            stmt.execute()
        }
    }
}

fun hasNamedCollection(bucket: String): Boolean? {
    return createConnection()?.use { connection ->
        connection.prepareStatement("SELECT 1 FROM system.named_collections WHERE name = ?").use { stmt ->
            stmt.setString(1, bucket)
            stmt.executeQuery().use(ResultSet::next)
        }
    }
}

fun createNamedCollection(bucket: String, ak: AccessKey?) {
    runStatementClickHouse(
        // placeholders can't be used for the identifier, but we already ensure safe names
        "CREATE NAMED COLLECTION `$bucket` AS " +
                "url = ? NOT OVERRIDABLE," +
                "access_key_id = ? NOT OVERRIDABLE," +
                "secret_access_key = ? NOT OVERRIDABLE",
        listOf(
            "bucket://$bucket/",
            ak!!.accessKeyId,
            ak.secretAccessKey,
        )
    )
}

fun deleteNamedCollection(bucket: String) {
    runStatementClickHouse("DROP NAMED COLLECTION `$bucket`")
}

fun createAuthorizedClickHouseUser(bucket: String) {
    runStatementClickHouse(
        "CREATE USER IF NOT EXISTS `$bucket` IDENTIFIED BY ?",
        listOf(CLICKHOUSE_PASSWORD_QUERYONLY)
    )
    runStatementClickHouse("GRANT CREATE TEMPORARY TABLE, S3 on *.* TO `$bucket`")
    runStatementClickHouse("GRANT NAMED COLLECTION ON `$bucket` TO `$bucket`")
}

fun deleteClickHouseUser(user: String) {
    runStatementClickHouse("DROP USER `$user`")
}