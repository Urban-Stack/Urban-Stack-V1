# Veröffentlichte Abfragen

Veröffentlichte Abfragen ermöglichen es,
das jeweils aktuelle Ergebnis einer konfigurierten SQL-Abfrage auf Sensordaten
(also die Tabellen `sensor_messages` und `sensor_messages_with_meta`)
öffentlich - also ohne Anmeldung - verfügbar zu machen.

Hierzu wird unterhalb einer Dashboardgruppe eine Abfrage konfiguriert.
Die Abfrage wird mit den Berechtigungen der Dashboardgruppe ausgeführt.

Abfragen können in der [Detailansicht für Dashboardgruppen](../berechtigungsverwaltung.md#dashboardgruppen-detailansicht) im Reiter "GeoJson" verwaltet werden, dies ist nur Personen mit der Berechtigung "Mitarbeiter" auf der Dashboardgruppe möglich.

## Übersicht

<figure>
  <img src="/screenshots/ugh-geojson-list-edit.webp" />
  <figcaption>Übersicht über die gespeicherten Abfragen dieser Dashboardgruppe. Hervorgehoben ist die Schaltfläche zum Bearbeiten.</figcaption>
</figure>

Hier werden alle veröffentlichten Abfragen angezeigt. Diese können direkt bearbeitet oder auch wieder gelöscht werden.

Die Ergebnisdaten sind unter  
`https://api.DOCS_BASE_DOMAIN/api/v2/query/mandantenname/dashboardgruppenname/queryname/geojson`  
als GeoJSON verfügbar.

Diese URL kann über den "Ergebnis anzeigen" Button aufgerufen werden:

<figure>
  <img src="/screenshots/ugh-geojson-list-show-result.webp" />
  <figcaption>Das Ergenis wird in einem neuen Tab geöffnet. Von dort aus kann die URL aus der Adresszeile des Browsers kopiert werden</figcaption>
</figure>

<!-- prettier-ignore -->
!!! danger "Bitte beachten!"
    Das Löschen einer veröffentlichten Abfrage kann nicht rückgängig gemacht werden! Es muss vor dem Löschen sichergestellt sein, dass die Abfrage in keinem Masterportal oder in einer anderen Anwendung verwendet wird!

Mit dem Button "Neue Query erstellen" kann eine neue Abfrage erstellt werden.

## Abfrage erstellen/bearbeiten

Beim Anlegen einer Abfrage kann der Name festgelegt werden, der allerdings danach nicht geändert werden kann.

Im Feld "SQL Query" wird die Abfrage angezeigt, kann allerdings dort nicht bearbeitet werden.

Unter "Query Editor" ist das Superset SQL Lab eingebunden, in dem Anfragen testweise ausgeführt werden können.

<!-- prettier-ignore -->
!!! warning "Bitte beachten!"
    In diesem Editor werden die Abfragen mit den Berechtigungen des jeweiligen Benutzers ausgeführt, die sich von den Berechtigungen der Dashboardgruppe unterscheiden können.

    Es empfiehlt sich daher, eine veröffentlichte Abfrage direkt nach dem Erstellen bzw. Ändern über den öffentlichen Link zu testen.

Als Geometrie für das erstellte GeoJSON wird hierbei die Spalte `geometry` im [WKT-Format](https://de.wikipedia.org/wiki/Simple_Feature_Access#Well-known_Text) verwendet.
Weitergehende Dokumentation zur Benutzung der `wkt` Funktion in findet sich in der [ClickHouse Dokumentation](https://clickhouse.com/docs/sql-reference/functions/geo/polygons#wkt).

<!-- prettier-ignore -->
!!! warning "Cache beachten!"
     Queries (aber nicht deren Ergebnisse) werden aus Effizienzgründen für 3 Minuten gespeichert. Es kann also nach dem Ändern der Abfrage bis zu 3 Minuten dauern, bis die Abfrage die neue Query benutzt.

### Datentypen

Als Basistypen sind in JSON nur Text (String) und numerische Werte (Float, Int) zugelassen. Daher müssen alle Spalten (wie z.B. `time`) mit einer Funktion versehen werden, um in eines dieser Formate umgewandelt zu werden, sonst kann die Spalte im fertigen GeoJSON nicht mitgeliefert werden.

## Beispiele

```sql title="Abfragebeispiel zur Illustration des Formats"
SELECT wkt((1.,2.)) AS geometry, 'abc' AS str, 123 AS num, toUnixTimestamp(now()) AS now
```

```json title="Ergebnis"
{
	"type": "FeatureCollection",
	"features": [
		{
			"geometry": { "coordinates": [1, 2], "type": "Point" },
			"properties": { "num": 123, "str": "abc", "now": 1759394559 },
			"type": "Feature"
		}
	]
}
```

```sql title="Durchschnittliche Temperatur der letzten Stunde"
select wkt((assumeNotNull(longitude), assumeNotNull(latitude))) as geometry, avg(temperature_outside) as temperature, formatDateTime(max(time), '%FT%T%z') as last from sensor_messages where time > addHours(now(), -1) and longitude is not null and latitude is not null group by geometry;
```

```json title="Ergebnis"
{
	"type": "FeatureCollection",
	"features": [
		{
			"geometry": { "coordinates": [8.3705, 51.9007], "type": "Point" },
			"properties": { "temperature": 20.5, "last": "2025-10-02T08:41:33+0000" },
			"type": "Feature"
		}
		{
			"geometry": { "coordinates": [9.9889448, 53.5438229], "type": "Point" },
			"properties": { "temperature": 19.3, "last": "2025-10-02T08:49:12+0000" },
			"type": "Feature"
		}
	]
}
```

Weitere Funktionen zum Formatieren vom Zeitwerten finden sich in der [Clickhouse Dokumentation](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#formatDateTime).

Es können auch geschlossene Polygone als Ausgabe-Geometrie genutzt werden. Die erste Koordinate muss mit der letzten übereinstimmen.

```sql title="Einfaches Polygon"
select wkt([(8.3705, 51.9007), (9.9889448, 51.9007), (9.9889448, 53.5438229), (8.3705, 53.5438229), (8.3705, 51.9007)]) as geometry;
```

```json title="Ergebnis"
{
	"type": "FeatureCollection",
	"features": [
		{
			"type": "Feature",
			"geometry": {
				"type": "Polygon",
				"coordinates": [
					[
						[8.3705, 51.9007],
						[9.9889, 51.9007],
						[9.9889, 53.5438],
						[8.3705, 53.5438],
						[8.3705, 51.9007]
					]
				]
			},
			"properties": {}
		}
	]
}
```
