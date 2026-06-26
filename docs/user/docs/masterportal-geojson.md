# Masterportal

## Daten aus dem Urbanstack anzeigen

### Veröffentlichte Abfrage erstellen

Im ersten Schritt muss eine [veröffentlichte Abfrage](./schnittstellen/veröffentlichte-abfragen.md) erstellt werden. Dafür sind bereits einige Beispiele dokumentiert: [Beispiele](./schnittstellen/veröffentlichte-abfragen.md#beispiele)

### GeoJSON Layer zu Masterportal hinzufügen

Um die im vorherigen Schritt erstellte veröffentlichte Abfrage (in der Form `https://api.DOCS_BASE_DOMAIN/api/v2/query/mandantenname/dashboardgruppenname/queryname/geojson`) im Masterportal anzuzeigen, muss diese als [GeoJSON layer](https://www.masterportal.org/mkdocs/doc/v3.8.0/User/Global-Config/services.json/#geojson-layer) angelegt werden.

Die folgende Beispielkonfiguration muss in der "Basic/config.json" unter `layerConfig` > `subjectlayer` > `elements` hinzugefügt werden. Weitere Informationen finden sich in der [Masterportal-Dokumentation](https://www.masterportal.org/mkdocs/doc/v3.8.0/User/Portal-Config/config.json/#layerconfigsubjectlayer).

```json
{
	"id": "test123",
	"name": "Mein tolles GeoJSON"
}
```

Dann muss der eigentliche Service in `services.json` angelegt werden, weitere Informationen finden sich auch hier in der [Masterportal-Dokumentation](https://www.masterportal.org/mkdocs/doc/v3.8.0/User/Global-Config/services.json/#geojson-layer).

```json
{
	"id": "test123",
	"name": "Mein tolles GeoJSON",
	"typ": "GeoJSON",
	"url": "https://api.DOCS_BASE_DOMAIN/api/v2/query/mandantenname/dashboardgruppenname/queryname/geojson",
	"styleId": "example-geojson",
	"gfiAttributes": "showAll"
}
```

Im nächsten Schritt muss ein Stil in der `style_v3.json` hinterlegt werden.

<!-- prettier-ignore -->
!!! warning "Wichtiger Hinweis"
    `id` und `styleId` sind frei wählbar, müssen aber in beiden Einträgen jeweils übereinstimmen.

```json
{
	"styleId": "example-geojson",
	"rules": [
		{
			"style": {
				"type": "circle"
			}
		}
	]
}
```

Dies stellt alle Ergebnisse aus der GeoJSON Abfrage als simple Punkte dar, weitere Darstellungsmöglichkeiten (wie z.B. Icons) finden sich in der [Masterportal-Dokumentation](https://www.masterportal.org/mkdocs/doc/v3.8.0/User/Global-Config/style.json/).

### Masterportal als Citytool installieren

Es muss sichergestellt sein, dass das Masterportal unter dem Menüpunkt [City Tools](https://govhub.DOCS_BASE_DOMAIN/citytools) installiert ist, dies kann nur von einem Administrator des Mandanten vorgenommen werden.

<figure>
  <img src="/screenshots/ugh-citytool-masterportal.webp" />
  <figcaption>Das installierte Masterportal in der City Tool Ansicht</figcaption>
</figure>

### Masterportal-Konfiguration hochladen

Um die Konfiguration des Masterportals in den Urbanstack hochladen zu können, müssen die Dateien erst als zip-Archiv verpackt werden. Dazu müssen die Ordner "Basic" und "mastercode" markiert werden und nach einem Rechtsklick die Option `Komprimieren` > `Komprimieren nach Archiv.zip` ausgewählt werden. Je nach Betriebssystem kann sich das Menü unterscheiden.

Die erstellte zip-Datei sollte folgender Struktur entsprechen: [Beispiel](snippet/Masterportal.zip)

Danach kann die zip-Datei von einem Administrator des Mandanten hochgeladen werden:

<figure>
  <img src="/screenshots/ugh-citytool-upload-button.webp" />
  <figcaption>Knopf zum Öffnen des Upload-Fensters</figcaption>
</figure>

<figure>
  <img src="/screenshots/ugh-citytool-masterportal-upload-confirm.webp" />
  <figcaption>Mit einem Klick auf "Datei hochladen" wird die Konfiguration des Masterportals ersetzt.</figcaption>
</figure>
