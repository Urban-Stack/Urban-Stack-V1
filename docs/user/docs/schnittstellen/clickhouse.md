# ClickHouse

## GraphQL-Schnittstelle

Über die [GraphQL-Schnittstelle](./graphql.md) können Daten aus der ClickHouse-Datenbank abgefragt werden. Dafür muss die SQL-Query mit der entsprechenden GraphQL-Query gesendet werden, die Antwort der Query wird als JSON zurückgegeben:

```graphql
query {
	clickhouseQuery(query: "SELECT * FROM sensor_messages LIMIT 10")
}
```

```json title="Ergebnis"
{
	"errors": [],
	"data": {
		"clickhouseQuery": { "meta": [{ "name": "project", "type": "String" }], "data": [], "rows": 0 }
	},
	"dataPresent": true
}
```

`clickhouseQuery` ohne Angabe eines Projektes ermöglicht es, die Daten aus den `sensor_messages` und `sensor_messages_with_meta` Tabellen abzufragen. Um Queries auszuführen, die auf Daten im S3 [Datei-Manager](../filemanager.md) zugreifen, muss das entsprechende Projekt als Parameter angegeben werden:

```graphql
query {
	clickhouseQuery(
		query: "SELECT SUM(test) FROM s3(`knuffingen.trainstation`,filename='test.csv',format='CSV')"
		project: { tenant: "knuffingen", project: "trainstation" }
	)
}
```

```json title="Ergebnis"
{
	"errors": [],
	"data": {
		"clickhouseQuery": {
			"meta": [{ "name": "SUM(test)", "type": "Nullable(Int64)" }],
			"data": [{ "SUM(test)": 42 }],
			"rows": 1
		}
	},
	"dataPresent": true
}
```

Es ist zu empfehlen, die Abfragen in [SQL-Lab](../superset.md#sql-lab) zu entwickeln, um diese dann automatisiert über die GraphQL-Schnittstelle ausführen zu können.
