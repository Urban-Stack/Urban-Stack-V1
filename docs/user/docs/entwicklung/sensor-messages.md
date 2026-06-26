# `sensor_messages`

## Neue Spalten hinzufügen

Alle bisherigen Spalten sind im Punkt [Internes Datenmodell](../schnittstellen/internes-datenmodell.md#sensor_messages) dokumentiert. Neue Spalten müssen dieser Dokumentation angefügt werden.

Um eine neue Spalte hinzuzufügen, müssen eine Reihe von Komponenten angepasst werden:

### ClickHouse

Die Migration in der `clickhouse.sql` Datei muss angepasst werden. Die neuen Spalten müssen mittels `ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS XXXXX Nullable(Float64);` in die Tabelle eingefügt werden.

Leider kann die Kafka-Tabelle nicht direkt verändert werden, deswegen muss diese, mitsamt `VIEW`, zuerst gelöscht und dann neu angelegt werden:

```sql
DROP TABLE IF EXISTS sensor_messages_kafka_4 ON CLUSTER clickhouse;
DROP VIEW IF EXISTS sensor_messages_mv_4 ON CLUSTER clickhouse;

CREATE TABLE IF NOT EXISTS sensor_messages_kafka_5
   ...
```

```diff title="Beispielhaftes Diff für das Hinzufügen einer neuen Spalte"
diff --git a/charts/udh-platform/files/clickhouse.sql b/charts/udh-platform/files/clickhouse.sql
index e161a91a..92e5cdf4 100644
--- a/charts/udh-platform/files/clickhouse.sql
+++ b/charts/udh-platform/files/clickhouse.sql
@@ -41,6 +41,7 @@ ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS pm2_5
 ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS pm10 Nullable(Float64);
 ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS distance Nullable(Float64);
 ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS pedestrian_traffic_h Nullable(Float64);
+ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS my_new_column Nullable(Float64);

 CREATE USER IF NOT EXISTS queryonly IDENTIFIED BY {QUERYONLY_PASSWORD:String};

@@ -56,7 +57,10 @@ GRANT ON CLUSTER clickhouse
 DROP TABLE IF EXISTS sensor_messages_kafka ON CLUSTER clickhouse;
 DROP VIEW IF EXISTS sensor_messages_mv ON CLUSTER clickhouse;

-CREATE TABLE IF NOT EXISTS sensor_messages_kafka_2
+DROP TABLE IF EXISTS sensor_messages_kafka_2 ON CLUSTER clickhouse;
+DROP VIEW IF EXISTS sensor_messages_mv_2 ON CLUSTER clickhouse;
+
+CREATE TABLE IF NOT EXISTS sensor_messages_kafka_3
   ON CLUSTER clickhouse
   AS sensor_messages
   ENGINE = Kafka('KAFKA_HOST:9092', 'sensor_messages', '{replica}', 'JSONEachRow')
@@ -64,11 +68,11 @@ CREATE TABLE IF NOT EXISTS sensor_messages_kafka_2
     kafka_thread_per_consumer = 0, kafka_num_consumers = 1,
     input_format_null_as_default = 0;

-CREATE MATERIALIZED VIEW IF NOT EXISTS sensor_messages_mv_2
+CREATE MATERIALIZED VIEW IF NOT EXISTS sensor_messages_mv_3
   ON CLUSTER clickhouse
   TO sensor_messages AS
   SELECT *
-  FROM sensor_messages_kafka_2;
+  FROM sensor_messages_kafka_3;

 CREATE TABLE IF NOT EXISTS sensor_meta
 ON CLUSTER clickhouse (
```

### Superset

Für Superset müssen die beiden Dateien `sensor_messages.yaml` und `sensor_messages_with_meta.yaml` angepasst werden. Die neue Spalte kann einfach am Ende hinzugefügt werden:

```yaml
  - <<: *float64
    column_name: my_new_column
```

### Ingestor

In der `IngestorApplication.kt` muss die neue Spalte ebenfalls gemappt werden. Für numerische Werte kann der neue Spaltenname zur bestehenden Liste `NUMBER_COLUMNS` hinzugefügt werden. Falls weitergehende Vorverarbeitung benötigt wird, kann dies im Kotlin-Code ergänzt werden.
