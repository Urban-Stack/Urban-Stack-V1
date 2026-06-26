# Ingestor

Der Ingestor dient dazu, Sensordaten als Datenstrom in die Plattform zu übertragen.

Dies kann entweder per HTTP-Anfrage an die Plattform oder über konfigurierte MQTT-Subscriptions geschehen.

## MQTT

Um Sensordaten über einen Anbieter mit MQTT-Schnittstelle zu empfangen, wird eine Subscription (technische Bezeichnung: `sensor-subscription`) angelegt.

Hierbei werden die Anmeldedaten und das erwartete Format konfiguriert.

<figure>
  <img src="/screenshots/ugh-mqtt-subscription.webp" />
  <figcaption>Anlegen einer MQTT-Subscription</figcaption>
</figure>

Der Ingestor wird sich nun mit dem MQTT-Server verbinden und die erhaltenen Sensordaten im zugehörigen Projekt speichern.

### MQTT-Formate

Beim Anlegen einer Subscription können verschiedene Formattypen ausgewählt werden, die das Empfangen von Daten von bestimmten Message-Broker-Plattformen oder eigenen Implementationen ermöglichen.

#### HTTP-Direct:

Dieses Format eignet sich für die Übertragung von Sensordaten als flaches JSON-Objekt über MQTT, beispielsweise durch ein Gerät wie den `ESP32`. Die Struktur des Objekts entspricht exakt dem Schema der zugehörigen Datenbanktabelle.

```json
{
	"time": 1733558400,
	"sensor_id": "my-sensor",
	"latitude": 81.5279,
	"longitude": 52.0221,
	"temperature_outside": 26.3,
	"uv_index": 2.23,
	"humidity_air": 88.33,
	"air_pressure": 1009.0,
	"wind_speed": 234.45,
	"wind_peak_gust": 23.34,
	"wind_direction": 90.0,
	"light_intensity": 34.0,
	"rain_intensity": 10.0,
	"rain_accumulated": 123.3,
	"battery_voltage": 99.0,
	"status": "0",
	"soil_moisture1": 123.23,
	"soil_moisture2": 124.23,
	"soil_moisture3": 123.23,
	"soil_moisture4": 125.23,
	"soil_water_column1": 35.67,
	"soil_water_column2": 35.67,
	"soil_water_column3": 35.67,
	"soil_water_column4": 35.67,
	"soil_water_tension1": 0.52,
	"soil_water_tension2": 0.54,
	"soil_water_tension3": 0.53,
	"soil_water_tension4": 0.56,
	"soil_temperature1": 12.23,
	"soil_temperature2": 12.24,
	"soil_temperature3": 12.23,
	"soil_temperature4": 12.25
}
```

#### TTN

Ein im The Things Network eingerichteter Sensor hat ohne spezielle Konfiguration ein vordefiniertes Format. Um eine möglichst reibungsfreie Verarbeitung der Daten zu ermöglichen, wird dieses Format von TTN mit diesem Formattyp automatisch ausgewertet und in der Datenbank abgespeichert. Ein LoRaWAN-kompatibles Objekt sieht folgendermaßen aus:

```json
{
	"uplink_message": {
		"locations": {
			"user": {
				"latitude": 81.5279,
				"longitude": 52.0221
			}
		},
		"end_device_ids": {
			"dev_eui": "my-sensor"
		},
		"decoded_payload": {
			"timestamp": 1733558400,
			"temperature_outside": 26.3,
			"uv_index": 2.23,
			"humidity_air": 88.33,
			"air_pressure": 1009.0,
			"wind_speed": 234.45,
			"wind_peak_gust": 23.34,
			"wind_direction": 90.0,
			"light_intensity": 34.0,
			"rain_intensity": 10.0,
			"rain_accumulated": 123.3,
			"battery_voltage": 99.0,
			"status": "0",
			"soil_moisture1": 123.23,
			"soil_moisture2": 124.23,
			"soil_moisture3": 123.23,
			"soil_moisture4": 125.23,
			"soil_water_column1": 35.67,
			"soil_water_column2": 35.67,
			"soil_water_column3": 35.67,
			"soil_water_column4": 35.67,
			"soil_water_tension1": 0.52,
			"soil_water_tension2": 0.54,
			"soil_water_tension3": 0.53,
			"soil_water_tension4": 0.56,
			"soil_temperature1": 12.23,
			"soil_temperature2": 12.24,
			"soil_temperature3": 12.23,
			"soil_temperature4": 12.25
		}
	}
}
```

#### Zenner

Ein in Zenner eingerichteter Sensor hat ohne spezielle Konfiguration ebenfalls ein vordefiniertes Format. Um eine möglichst reibungsfreie Verarbeitung der Daten zu ermöglichen, wird dieses Format automatisch ausgewertet und in der Datenbank abgespeichert. Ein Zenner-kompatibles Objekt sieht folgendermaßen aus:

```json
{
	"data": {
		"measured_at": "2025-08-07T09:26:04+00:00",
		"device_id": "my-sensor",
		"latitude": 8.5279,
		"longitude": 52.0221,
		"temperature_outside": 26.3,
		"uv_index": 2.23,
		"humidity_air": 88.33,
		"air_pressure": 1009.0,
		"wind_speed": 234.45,
		"wind_peak_gust": 23.34,
		"wind_direction": 90.0,
		"light_intensity": 34.0,
		"rain_intensity": 10.0,
		"rain_accumulated": 123.3,
		"battery_voltage": 99.0,
		"status": "0",
		"soil_moisture1": 123.23,
		"soil_moisture2": 124.23,
		"soil_moisture3": 123.23,
		"soil_moisture4": 125.23,
		"soil_water_column1": 35.67,
		"soil_water_column2": 35.67,
		"soil_water_column3": 35.67,
		"soil_water_column4": 35.67,
		"soil_water_tension1": 0.52,
		"soil_water_tension2": 0.54,
		"soil_water_tension3": 0.53,
		"soil_water_tension4": 0.56,
		"soil_temperature1": 12.23,
		"soil_temperature2": 12.24,
		"soil_temperature3": 12.23,
		"soil_temperature4": 12.25
	}
}
```

## HTTP

Alternativ kann, insbesondere für eigene Integrationen, der HTTP-Endpunkt hilfreich sein.

Hierzu wird ein `sensor-credential` im Kontext eines Projektes angelegt. Die so erstellten Zugangsdaten werden mit jeder Anfrage mitgesendet
und sorgen neben der Berechtigung, auch für die korrekte Zuordnung zu diesem Projekt.

<figure>
  <img src="/screenshots/ugh-sensor-credentials.webp" />
  <figcaption>Anzeige der erstellten Sensor Credentials</figcaption>
</figure>

HTTP-Anfragen werden an `https://api.DOCS_BASE_DOMAIN/api/v2/sensor/message/direct` gesendet.

```json title="Beispielanfrage"
{
	"time": 1735686000,
	"latitude": 52.0,
	"longitude": 8.0,
	"humidity_air": 64.8,
	"uv_index": 0
}
```

Dabei muss `time` als [Unix-Zeitstempel](https://de.wikipedia.org/wiki/Unixzeit) übergeben werden.

Die akzeptierten Schlüssel und ihre Werte sind im Kapitel [Internes Datenmodell](./internes-datenmodell.md) dokumentiert.

Die Credentials werden hierbei als Benutzername und Passwort für [Basic authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication#basic_authentication_scheme) verwendet.
