# Internes Datenmodell

## `sensor_messages`

Alle Zeitreihen Daten, die ihren Weg in die Plattform finden ([Ingestor](./ingestor.md)) werden in einem breiten Tabellenformat gespeichert.

In Superset ist diese Tabelle in der Datenbank `clickhouse` mit dem Namen `sensor_messages` abfragbar (z.B. `select * from sensor_messages`). Diese Spalten können in Diagrammen und Dashboards zur Visualisierung genutzt werden.

Folgende Spalten sind verfügbar:

<style>
    .md-typeset table tr > :first-child {
        white-space: pre;
        /* don't wrap first column*/
    }
</style>

| Spaltenname            | Datentyp | NULL möglich? | Einheit             | Beschreibung                                                                                                    |
| ---------------------- | -------- | ------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `time`                 | DateTime | Nein          |                     | der Zeitpunkt, zu dem die Messdaten aufgenommen wurden                                                          |
| `project`              | String   | Nein          |                     | das Projekt, dem diese Daten zugeordnet sind, kann nicht manuell gesetzt werden, wird von der Plattform gesetzt |
| `sensor_id`            | String   | Ja            |                     | eine eindeutige Identifikation des Sensors, der diese Daten erfasst hat                                         |
| `latitude`             | Float64  | Ja            |                     | der Längengrad der Position, an der die Daten erfasst wurden                                                    |
| `longitude`            | Float64  | Ja            |                     | der Breitengrad der Position, an der die Daten erfasst wurden                                                   |
| `temperature_outside`  | Float32  | Ja            | °C                  | die gemessene Temperatur                                                                                        |
| `uv_index`             | Float64  | Ja            |                     | Belastungsstärke durch Ultraviolette Strahlung                                                                  |
| `humidity_air`         | Float64  | Ja            | %                   | Relative Luftfeuchtigkeit                                                                                       |
| `air_pressure`         | Float64  | Ja            | hPa                 | Luftdruck                                                                                                       |
| `wind_speed`           | Float64  | Ja            | m/s                 | aktuelle Windgeschwindigkeit                                                                                    |
| `wind_peak_gust`       | Float64  | Ja            | m/s                 | Windgeschwindigkeit im lokalen Maximum                                                                          |
| `wind_direction`       | Float64  | Ja            | °                   | Richtung des Windes                                                                                             |
| `light_intensity`      | Float64  | Ja            | cd (Candela)        | Lichtstärke                                                                                                     |
| `rain_intensity`       | Float64  | Ja            | mm/min              | Aktuelle Regenintensität                                                                                        |
| `rain_accumulated`     | Float64  | Ja            | mm                  | Gesamte Niederschlagsmenge                                                                                      |
| `battery_voltage`      | Float64  | Ja            | V (Volt)            | Aktuelle Spannung der Batterie                                                                                  |
| `status`               | String   | Ja            |                     | Status des Geräts (normalerweise OK)                                                                            |
| `soil_moisture1`       | Float64  | Ja            | %                   | Bodenfeuchte 1, in VMC (Volumetric Water Content)                                                               |
| `soil_moisture2`       | Float64  | Ja            | %                   | Bodenfeuchte 2, in VMC (Volumetric Water Content)                                                               |
| `soil_moisture3`       | Float64  | Ja            | %                   | Bodenfeuchte 3, in VMC (Volumetric Water Content)                                                               |
| `soil_moisture4`       | Float64  | Ja            | %                   | Bodenfeuchte 4, in VMC (Volumetric Water Content)                                                               |
| `soil_water_column1`   | Float64  | Ja            |                     | Wasserstand 1                                                                                                   |
| `soil_water_column2`   | Float64  | Ja            |                     | Wasserstand 2                                                                                                   |
| `soil_water_column3`   | Float64  | Ja            |                     | Wasserstand 3                                                                                                   |
| `soil_water_column4`   | Float64  | Ja            |                     | Wasserstand 4                                                                                                   |
| `soil_water_tension1`  | Float64  | Ja            | cb (centibar)       | Wasserspannung 1                                                                                                |
| `soil_water_tension2`  | Float64  | Ja            | cb (centibar)       | Wasserspannung 2                                                                                                |
| `soil_water_tension3`  | Float64  | Ja            | cb (centibar)       | Wasserspannung 3                                                                                                |
| `soil_water_tension4`  | Float64  | Ja            | cb (centibar)       | Wasserspannung 4                                                                                                |
| `soil_temperature1`    | Float64  | Ja            | °C                  | Bodentemperatur 1                                                                                               |
| `soil_temperature2`    | Float64  | Ja            | °C                  | Bodentemperatur 2                                                                                               |
| `soil_temperature3`    | Float64  | Ja            | °C                  | Bodentemperatur 3                                                                                               |
| `soil_temperature4`    | Float64  | Ja            | °C                  | Bodentemperatur 4                                                                                               |
| `pm2_5`                | Float64  | Ja            | µg/m³               | Feinstaub (PM2.5)                                                                                               |
| `pm10`                 | Float64  | Ja            | µg/m³               | Feinstaub (PM10)                                                                                                |
| `distance`             | Float64  | Ja            | cm                  | Distanz                                                                                                         |
| `pedestrian_traffic_h` | Float64  | Ja            | Personen pro Stunde | Durschnittliche Passantenfrequenz                                                                               |
| `lux`                  | Float64  | Ja            | lux                 | Beleuchtungsstärke                                                                                              |
| `co2`                  | Float64  | Ja            | ppm                 | Kohlendioxid                                                                                                    |
| `temperature_inside`   | Float32  | Ja            | °C                  | die gemessene Innentemperatur                                                                                   |
| `battery_level`        | Float64  | Ja            | %                   | Batterieladestand in Prozent                                                                                    |

Folgende Spalten sind ebenfalls Teil des internen Datenmodells, werden allerdings mit einem anderen Schlüsselnamen eingeliefert.

| Orginal Payload                    | Spaltenname                                | Datentyp | NULL möglich? | Einheit          | Beschreibung                            |
| ---------------------------------- | ------------------------------------------ | -------- | ------------- | ---------------- | --------------------------------------- |
| `alarm`                            | `bp_alarm`                                 | Int64    | Ja            | –                | Alarmstatus                             |
| `bat_perc`                         | `bp_bat_perc`                              | Int64    | Ja            | %                | Batterieladestand in Prozent            |
| `beep_base`                        | `bp_beep_base`                             | Bool     | Ja            | –                | Beepbase status                         |
| `bv`                               | `bp_bv`                                    | Float64  | Ja            | Volt             | Gemessene Batteriespannung              |
| `ds18b20_present`                  | `bp_ds18b20_present`                       | Bool     | Ja            | –                | Verfügbarkeit eines Temperatursensors   |
| `ds18b20_sensor_amount`            | `bp_ds18b20_sensor_amount`                 | Int64    | Ja            | Anzahl           | Anzahl erkannter Temperatursensoren     |
| `fft_bin_amount`                   | `bp_fft_bin_amount`                        | Int64    | Ja            | Bins             | Anzahl der FFT-Frequenzbereiche         |
| `fft_hz_per_bin`                   | `bp_fft_hz_per_bin`                        | Int64    | Ja            | Hz/Bin           | Frequenzauflösung pro FFT-Bereich       |
| `fft_present`                      | `bp_fft_present`                           | Bool     | Ja            | –                | FFT-Analyse verfügbar                   |
| `fft_start_bin`                    | `bp_fft_start_bin`                         | Int64    | Ja            | Bin              | Startbereich der FFT-Auswertung         |
| `fft_stop_bin`                     | `bp_fft_stop_bin`                          | Int64    | Ja            | Bin              | Endbereich der FFT-Auswertung           |
| `s_bin_122_173`                    | `bp_s_bin_122_173`                         | Int64    | Ja            | unsigned integer | Aktivität im Frequenzbereich 122–173 Hz |
| `s_bin_173_224`                    | `bp_s_bin_173_224`                         | Int64    | Ja            | unsigned integer | Aktivität im Frequenzbereich 173–224 Hz |
| `s_bin_224_276`                    | `bp_s_bin_224_276`                         | Int64    | Ja            | unsigned integer | Aktivität im Frequenzbereich 224–276 Hz |
| `s_bin_276_327`                    | `bp_s_bin_276_327`                         | Int64    | Ja            | unsigned integer | Aktivität im Frequenzbereich 276–327 Hz |
| `s_bin_327_378`                    | `bp_s_bin_327_378`                         | Int64    | Ja            | unsigned integer | Aktivität im Frequenzbereich 327–378 Hz |
| `s_bin_378_429`                    | `bp_s_bin_378_429`                         | Int64    | Ja            | unsigned integer | Aktivität im Frequenzbereich 378–429 Hz |
| `s_bin_429_480`                    | `bp_s_bin_429_480`                         | Int64    | Ja            | unsigned integer | Aktivität im Frequenzbereich 429–480 Hz |
| `s_bin_480_532`                    | `bp_s_bin_480_532`                         | Int64    | Ja            | unsigned integer | Aktivität im Frequenzbereich 480–532 Hz |
| `s_bin_532_583`                    | `bp_s_bin_532_583`                         | Int64    | Ja            | unsigned integer | Aktivität im Frequenzbereich 532–583 Hz |
| `s_bin_71_122`                     | `bp_s_bin_71_122`                          | Int64    | Ja            | unsigned integer | Aktivität im Frequenzbereich 71–122 Hz  |
| `t_i`                              | `bp_t_i`                                   | Float64  | Ja            | °C               | Gemessene Innentemperatur               |
| `w_v`                              | `bp_w_v`                                   | Int64    | Ja            | Sensorabhängig   | Rohwert des Gewichtssensors             |
| `weight_present`                   | `bp_weight_present`                        | Bool     | Ja            | –                | Gewichtssensor verfügbar                |
| `weight_sensor_amount`             | `bp_weight_sensor_amount`                  | Int64    | Ja            | Anzahl           | Anzahl erkannter Gewichtssensoren       |
| `status`                           | `status_parking`                           | Bool     | Ja            | -                |                                         |
| `previous_state_duration`          | `previous_state_duration_parking`          | Float64  | Ja            | -                |                                         |
| `previous_state_duration_error`    | `previous_state_duration_error_parking`    | Float64  | Ja            | -                |                                         |
| `previous_state_duration_overflow` | `previous_state_duration_overflow_parking` | Bool     | Ja            | -                |                                         |

## `sensor_meta`

Metadaten für Sensoren sind über die Tabelle `sensor_meta` abfragbar. Folgende Spalten sind verfügbar:

| Spaltenname            | Datentyp | NULL möglich? | Beschreibung                                                                                                    |
| ---------------------- | -------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| `project`              | String   | Nein          | das Projekt, dem diese Daten zugeordnet sind, kann nicht manuell gesetzt werden, wird von der Plattform gesetzt |
| `sensor_id`            | String   | Nein          | eine eindeutige Identifikation des Sensors, zu dem diese Metadaten gehören                                      |
| `external_reference`   | String   | Ja            | eine Referenz zu einem externen System, z.B. der Baumkataster-Nummer                                            |
| `location_description` | String   | Ja            | eine Beschreibung für den Standort des Sensors, z.B. "unter der Brücke"                                         |
| `location_name`        | String   | Ja            | der Name des Standortes, z.B. "Hauptstraße"                                                                     |
| `sensor_type`          | String   | Ja            | die Typenbezeichnung des Sensors, z.B. "SMC30"                                                                  |
| `custom1`              | String   | Ja            | eine beliebig verwendbare Spalte                                                                                |
| `custom2`              | String   | Ja            | eine beliebig verwendbare Spalte                                                                                |
| `custom3`              | String   | Ja            | eine beliebig verwendbare Spalte                                                                                |
| `custom4`              | String   | Ja            | eine beliebig verwendbare Spalte                                                                                |
| `custom5`              | String   | Ja            | eine beliebig verwendbare Spalte                                                                                |

## `sensor_messages_with_meta`

Dieser View ist das Ergebnis des Joins von `sensor_messages` und `sensor_meta` über `project` und `sensor_id`, wobei immer alle Spalten der Tabelle `sensor_messages`zurückgegeben werden.
