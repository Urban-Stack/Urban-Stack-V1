CREATE TABLE IF NOT EXISTS sensor_messages
ON CLUSTER clickhouse (
  time DateTime,
  project String,
  sensor_id Nullable(String),
  latitude Nullable(Float64),
  longitude Nullable(Float64),
  temperature_outside Nullable(Float32),
  uv_index Nullable(Float64),
  humidity_air Nullable(Float64),
  air_pressure Nullable(Float64),
  wind_speed Nullable(Float64),
  wind_peak_gust Nullable(Float64),
  wind_direction Nullable(Float64),
  light_intensity Nullable(Float64),
  rain_intensity Nullable(Float64),
  rain_accumulated Nullable(Float64),
  battery_voltage Nullable(Float64),
  status Nullable(String),
  soil_moisture1 Nullable(Float64),
  soil_moisture2 Nullable(Float64),
  soil_moisture3 Nullable(Float64),
  soil_moisture4 Nullable(Float64),
  soil_water_column1 Nullable(Float64),
  soil_water_column2 Nullable(Float64),
  soil_water_column3 Nullable(Float64),
  soil_water_column4 Nullable(Float64),
  soil_water_tension1 Nullable(Float64),
  soil_water_tension2 Nullable(Float64),
  soil_water_tension3 Nullable(Float64),
  soil_water_tension4 Nullable(Float64),
  soil_temperature1 Nullable(Float64),
  soil_temperature2 Nullable(Float64),
  soil_temperature3 Nullable(Float64),
  soil_temperature4 Nullable(Float64)
)
  ENGINE = MergeTree
  ORDER BY time;

ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS pm2_5 Nullable(Float64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS pm10 Nullable(Float64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS distance Nullable(Float64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS pedestrian_traffic_h Nullable(Float64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS lux Nullable(Float64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS co2 Nullable(Float64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS temperature_inside Nullable(Float32);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS battery_level Nullable(Float64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_alarm Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_bat_perc Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_beep_base Nullable(Bool);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_bv Nullable(Float64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_ds18b20_present Nullable(Bool);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_ds18b20_sensor_amount Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_fft_bin_amount Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_fft_hz_per_bin Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_fft_present Nullable(Bool);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_fft_start_bin Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_fft_stop_bin Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_s_bin_122_173 Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_s_bin_173_224 Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_s_bin_224_276 Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_s_bin_276_327 Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_s_bin_327_378 Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_s_bin_378_429 Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_s_bin_429_480 Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_s_bin_480_532 Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_s_bin_532_583 Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_s_bin_71_122 Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_t_i Nullable(Float64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_w_v Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_weight_present Nullable(Bool);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS bp_weight_sensor_amount Nullable(Int64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS status_parking Nullable(Bool);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS previous_state_duration_parking Nullable(Float64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS previous_state_duration_error_parking Nullable(Float64);
ALTER TABLE sensor_messages ON CLUSTER clickhouse ADD COLUMN IF NOT EXISTS previous_state_duration_overflow_parking Nullable(Bool);

CREATE USER IF NOT EXISTS queryonly IDENTIFIED BY {QUERYONLY_PASSWORD:String};

CREATE ROW POLICY IF NOT EXISTS project_queryonly
  ON CLUSTER clickhouse
  ON sensor_messages
  USING project IN splitByString(' ', getSetting('SQL_projects'))
  TO queryonly;

GRANT ON CLUSTER clickhouse
  SELECT ON default.sensor_messages TO queryonly;

DROP TABLE IF EXISTS sensor_messages_kafka ON CLUSTER clickhouse;
DROP VIEW IF EXISTS sensor_messages_mv ON CLUSTER clickhouse;

DROP TABLE IF EXISTS sensor_messages_kafka_2 ON CLUSTER clickhouse;
DROP VIEW IF EXISTS sensor_messages_mv_2 ON CLUSTER clickhouse;

DROP TABLE IF EXISTS sensor_messages_kafka_3 ON CLUSTER clickhouse;
DROP VIEW IF EXISTS sensor_messages_mv_3 ON CLUSTER clickhouse;

CREATE TABLE IF NOT EXISTS sensor_messages_kafka_4
  ON CLUSTER clickhouse
  AS sensor_messages
  ENGINE = Kafka('KAFKA_HOST:9092', 'sensor_messages', '{replica}', 'JSONEachRow')
  SETTINGS
    kafka_thread_per_consumer = 0, kafka_num_consumers = 1,
    input_format_null_as_default = 0;

CREATE MATERIALIZED VIEW IF NOT EXISTS sensor_messages_mv_4
  ON CLUSTER clickhouse
  TO sensor_messages AS
  SELECT *
  FROM sensor_messages_kafka_4;

CREATE TABLE IF NOT EXISTS sensor_meta
ON CLUSTER clickhouse (
  project String,
  sensor_id String,
  external_reference Nullable(String),
  location_description Nullable(String),
  location_name Nullable(String),
  sensor_type Nullable(String),
  custom1 Nullable(String),
  custom2 Nullable(String),
  custom3 Nullable(String),
  custom4 Nullable(String),
  custom5 Nullable(String)
)
  ENGINE = MergeTree
  ORDER BY sensor_id;

CREATE TABLE IF NOT EXISTS sensor_meta_postgres
  ON CLUSTER clickhouse
  AS sensor_meta
  ENGINE = PostgreSQL(postgres_sensormeta);

CREATE ROW POLICY IF NOT EXISTS project_queryonly
  ON CLUSTER clickhouse
  ON sensor_meta
  USING project IN splitByString(' ', getSetting('SQL_projects'))
  TO queryonly;

CREATE MATERIALIZED VIEW IF NOT EXISTS sensor_meta_mv
  ON CLUSTER clickhouse
  REFRESH EVERY 1 HOUR
  TO sensor_meta AS
  SELECT *
  FROM sensor_meta_postgres;

GRANT ON CLUSTER clickhouse
  SELECT ON default.sensor_meta TO queryonly;

CREATE OR REPLACE VIEW sensor_messages_with_meta
  ON CLUSTER clickhouse
  AS SELECT * FROM sensor_messages LEFT OUTER JOIN sensor_meta ON sensor_messages.project = sensor_meta.project AND sensor_messages.sensor_id = sensor_meta.sensor_id;

GRANT ON CLUSTER clickhouse
  SELECT ON default.sensor_messages_with_meta TO queryonly;
