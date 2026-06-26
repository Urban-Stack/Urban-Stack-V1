# Superset

Unter [`https://superset.DOCS_BASE_DOMAIN/`](https://superset.DOCS_BASE_DOMAIN/) steht eine Superset-Installation
bereit,
die es angemeldeten Benutzern der Plattform ermöglicht,
Diagramme zu erstellen sowie Dashboards zusammenzustellen und zu veröffentlichen.

Superset ist ebenfalls in Gov Hub und Citizen Hub integriert.

## Sichtbarkeit über Dashboardgruppen

Dashboards sind immer einer Dashboardgruppe zugeordnet.
Diese legt fest, welche Daten für Diagramme auf dem Dashboard zugreifbar sind.

<!-- prettier-ignore -->
!!! info "Hinweis"
    Um die verschiedenen Funktionen von Superset im Kontext von Dashboards zu ermöglichen
    sind alle in Diagrammen des Dashboards verwendeten Datensätze für erlaubte Betrachter des Dashboards beliebig abfragbar.
    Dies schließt bei veröffentlichten Dashboards anonyme Benutzer ein.

## Dashboard-Tags

Tags können Dashboards von der [Dashboardliste](https://superset.DOCS_BASE_DOMAIN/dashboard/list/) aus zugewiesen
werden.

<figure>
  <img src="/screenshots/superset-dashboard-edit-button.webp" />
  <figcaption>Bearbeiten-Button in Dashboardliste</figcaption>
</figure>

<figure>
  <img src="/screenshots/superset-dashboard-tag.webp" />
  <figcaption>Tag-Einstellung in Dashboardeinstellungen</figcaption>
</figure>

## Alarme und Berichte

Superset ermöglicht es, automatisierte Alarme und Berichte per E-Mail zu versenden:

- **Berichte** werden regelmäßig nach einem festgelegten Zeitplan verschickt.
- **Alarme** werden ausgelöst, wenn vordefinierte SQL-Bedingungen erfüllt sind.

### Berichte einrichten

Berichte können auf unterschiedliche Weise angelegt werden, es kann ein einfacher Bericht angelegt werden, welcher größtenteils Standard-Einstellungen verwendet oder es kann ein detaillierter Bericht angelegt werden, welcher einige weitere Optionen bietet. Ein Bericht kann ein ganzes Dashboard umfassen oder ein einzelnes Diagramm.

<!-- prettier-ignore -->
!!! info "Hinweis"
    Die einfache Berichtseinrichtung erlaubt nur den Versand von Berichten an die E-Mail-Adresse des jeweiligen Erstellers.

### Einfachen Dashboard-Bericht einrichten

1. **Dashboard** öffnen, das als Bericht versendet werden soll.
2. Dialog zur Einrichtung des Berichts mithilfe des `...`-Bedienelements öffnen -> `E-Mail-Bericht verwalten` -> `E-Mail-Bericht einrichten`

<figure>
  <img src="/screenshots/create-simple-report-dashboard.webp" />
  <figcaption>Einfachen Dashboard-Bericht in Superset anlegen</figcaption>
</figure>

3. Bericht konfigurieren

- **Berichtsname** festlegen
- Optional kann noch eine **Beschreibung** definiert werden
- **Zeitplan festlegen:** z. B. täglich um 12:00, wöchentlich Mo,Mi um 10:00 Uhr

4. Bericht über **Hinzufügen** speichern

### Einfachen Diagramm-Bericht einrichten

1. **Diagramm** öffnen, das als Bericht versendet werden soll.
2. Dialog zur Einrichtung des Berichts mithilfe des `...`-Bedienelements öffnen -> `E-Mail-Bericht verwalten` -> `E-Mail-Bericht einrichten`

<figure>
  <img src="/screenshots/create-simple-report-diagram.webp" />
  <figcaption>Einfachen Diagramm-Bericht in Superset anlegen</figcaption>
</figure>

3. Bericht konfigurieren

- **Berichtsname** festlegen
- Optional kann noch eine **Beschreibung** definiert werden
- **Zeitplan festlegen:** z. B. täglich um 12:00, wöchentlich Mo,Mi um 10:00 Uhr
- Art des Berichts festlegen (eingebetteter Text, als Bild(PNG) oder als CSV-Dateianhang)

4. Bericht über **Hinzufügen** speichern

### Detaillierte Berichte

Auf der zentralen [**Berichtsübersicht-Seite**](https://superset.DOCS_BASE_DOMAIN/report/list/) in Superset, können die erstellten einfachen Berichte um einige Details erweitert werden. Sie können außerdem direkt detaillierte Berichte erstellen.

#### Detaillierten Bericht erstellen

1. Klicken auf **`+ Bericht`** um einen neuen Bericht zu erstellen.

<figure>
  <img src="/screenshots/create-advanced-report-diagram.webp" />
  <figcaption>Detaillierten Bericht in Superset anlegen</figcaption>
</figure>

2. Bericht konfigurieren:

- **Allgemeine Informationen:**
  - **Berichtsnamen** festlegen
  - Optional kann noch eine **Beschreibung** definiert werden
- **Inhalt des Berichts:**
  - Welche Art des Berichts, gesamtes Dashboard oder einzelnes Diagramm?
  - Inhaltsformat: (z.B. `PNG` und `PDF`)
- **Zeitplan:** z. B. täglich um 12:00 Uhr, wöchentlich Mo, Mi um 10:00 Uhr
- **Benachrichtigungsmethode:**
  - Optional **E-Mail-Betreffname** festlegen
  - **Empfänger / CC-Empfänger / BCC-Empfänger** konfigurieren

3. Bericht über **Hinzufügen** speichern

#### Bestehende Berichte anpassen

1. Auf die Listenanzeige der Berichte unter [**https://superset.urbanstack.de/report/list**](https://superset.urbanstack.de/report/list) navigieren
2. Mauszeiger auf den Bericht bewegen der anpasst werden soll.
3. Auf das `Bearbeiten`-Symbol klicken.

<figure>
  <img src="/screenshots/edit-symbol-report.webp" />
  <figcaption>Bearbeiten-Symbol</figcaption>
</figure>

3. Vorhandene Konfiguration anpassen.

### Alarme

Alarme unterscheiden sich von Berichten, da sie nur Berichte versenden, wenn bestimmte Alarmierungsbedingungen erfüllt sind (z.B. erhöhte Temperatur). Um diese Bedingung zu festzulegen werden SQL-Bedingungen genutzt.

<!-- prettier-ignore -->
!!! info "Hinweis"
    Superset prüft nicht kontinuierlich in Echtzeit. Stattdessen wird in festgelegten Zeitintervallen die definierte SQL-Bedingung ausgewertet. Wenn die Bedingung in diesem Zeitfenster zutrifft, wird der Alarm ausgelöst und eine Benachrichtigung verschickt.

### Alarmierungsbedingungen

Eine Alarmierungsbedingung besteht aus einem SQL-Abfragebefehl, der einen numerisch interpretierbaren Wert zurückgibt, einer Bedingung (z.B. `>`, `<=`, oder `==`) und einem Vergleichswert.

### Alarme einrichten

1. Öffnen der zentralen [**Alarmübersicht**](https://superset.DOCS_BASE_DOMAIN/alerts/list/) in Superset.
2. Klicken auf **`+ Alarm`**.

<figure>
  <img src="/screenshots/superset-alert-config.webp" />
  <figcaption>Alarm-Konfiguration</figcaption>
</figure>

3. **Allgemeine Informationen:**

- **Alarmnamen** festlegen
- Optional kann noch eine **Beschreibung** definiert werden

4. **Alarmierungsbedingung:**

- Festlegen eines SQL-Abfragebefehls
- Auswahl einer Bedingung
- Festlegen eines Vergleichswertes

5. **Inhalt des Alarms:**

- Für welches Dashboard oder Diagramm soll der Bericht erstellt werden?
- Inhaltsformat: (z.B. `PNG` und `PDF`)

6. **Zeitplan**

- legt fest, zu welchem Zeitpunkt die definierte SQL-Bedingung ausgewertet werden soll
- (z. B. täglich um 12:00 Uhr, wöchentlich Mo, Mi um 10:00 Uhr)

7. **Benachrichtigungsmethode:**

- Optional **E-Mail-Betreffname** festlegen
- **Empfänger / CC-Empfänger / BCC-Empfänger** konfigurieren

8. Alarm über **Hinzufügen** speichern

#### Bestehende Alarme anpassen

1. Auf die Listenanzeige der Alarme unter [**https://superset.urbanstack.de/alert/list**](https://superset.urbanstack.de/alert/list) navigieren.
2. Mauszeiger auf den Bericht bewegen der anpasst werden soll.
3. Auf das `Bearbeiten`-Symbol klicken.

<figure>
  <img src="/screenshots/edit-symbol-report.webp" />
  <figcaption>Bearbeiten-Symbol</figcaption>
</figure>

3. Vorhandene Konfiguration anpassen.

## Dashboard als PDF herunterladen

Bei Bedarf kann eine PDF-Datei eines Dashboards über das Menü heruntergeladen werden.

Nach dem Auslösen dauert es noch einen Moment bis der Download startet, da die PDF zuerst erzeugt werden muss.

<figure>
  <img src="/screenshots/superset-dashboard-export-pdf.webp" />
  <figcaption>PDF-Erstellung über das Dashboard-Menü</figcaption>
</figure>

## Dashboard-Übersichtsseite

Die Dashboard-Übersichtsseite findet sich im [Gov Hub](https://govhub.DOCS_BASE_DOMAIN/) unter dem Menüpunkt "
Dashboards".

<figure>
  <img src="/screenshots/govhub-dashboards.webp" />
  <figcaption>Link zu den Dashboards</figcaption>
</figure>

Auf dieser Seite werden alle Dashboards angezeigt, die der eingeloggte Benutzer sehen darf.

<figure>
  <img src="/screenshots/ugh-dashboards-overview.webp" />
  <figcaption>Dashboardübersicht</figcaption>
</figure>

### Dashboard erstellen

Über den Button "Dashboard erstellen" öffnet sich ein Dropdown, in dem der Name des neuen Dashboards sowie die
Dashboardgruppe ausgewählt werden kann.

<figure>
  <img src="/screenshots/ugh-create-dashboard.webp" />
  <figcaption>Ein neues Dashboard in der Dashboardgruppe "Umwelt" erstellen</figcaption>
</figure>

## Dashboard-Detailansicht

Direkt nachdem ein Dashboard erstellt wurde oder wenn man in der Übersicht ein Dashboard anklickt gelangt man zur
Detailansicht des Dashboards.

Hier kann man seinen [E-Mail Bericht konfigurieren](#alarme-und-berichte) oder das Dashboard
als [PDF oder Bild exportieren](#dashboard-als-pdf-herunterladen).

Hat man die entsprechenden Berechtigungen, kann man das Dashboard hier bearbeiten oder veröffentlichen.

<figure>
  <img src="/screenshots/superset-dashboard-view.webp" />
  <figcaption>Detailansicht eines Dashboards</figcaption>
</figure>

### Dashboard bearbeiten

Mit einem Klick auf "Dashboard bearbeiten" kann in den Bearbeitungsmodus gewechselt werden. Dort können aus der rechten
Seitenleiste Diagramme und sonstige Layout-Elemente per Drag & Drop zum Dashboard hinzugefügt werden. Die Diagramme
können im Dashboard beliebig angeordnet werden.

Auch können durch einen Klick auf "Neues Diagramm erstellen" [Diagramme erstellt](#diagramm-erstellen) werden, die beim
Speichern direkt dem Dashboard hinzugefügt werden.

<figure>
  <img src="/screenshots/superset-to-new-chart.webp" />
  <figcaption>Ein neues Chart erstellen</figcaption>
</figure>

<figure>
  <img src="/screenshots/superset-dashboard-save.webp" />
  <figcaption>Änderungen am Dashboard speichern</figcaption>
</figure>

### Dashboard veröffentlichen

Standardmäßig sind Dashboards nur für Personen zu sehen, die die Berechtigung "Betrachter" auf der Dashboardgruppe
besitzen. Allerdings können Dashboards auch veröffentlicht werden, sodass diese für jeden lesend zugänglich sind und
auch im Citizen Hub angezeigt werden.

<figure>
  <img src="/screenshots/superset-make-dashboard-public.webp" />
  <figcaption>Button, um Intern/Veröffentlicht umzuschalten</figcaption>
</figure>

### Dashboard löschen

Durch einen Klick auf das Mülleimer-Icon kann ein Dashboard gelöscht werden. Die Diagramme des Dashboards werden dabei
nicht gelöscht.

<figure>
  <img src="/screenshots/superset-dashboard-delete.webp" />
  <figcaption>Löschen eines Dashboards</figcaption>
</figure>

## Diagramme

Eine Liste aller Diagramme findet sich direkt auf [Superset](https://superset.DOCS_BASE_DOMAIN/chart/list)

### Diagramm erstellen

Die Seite, um ein Diagramm zu erstellen, kann wahlweise über das [Bearbeiten eines Dashboards](#dashboard-bearbeiten)
oder auch [direkt in Superset](https://superset.DOCS_BASE_DOMAIN/chart/add) erreicht werden.

Um ein Diagramm zu erstellen muss als erstes die Datenquelle ausgewählt werden.

- `sensor_messages` beinhaltet alle Sensordaten, auf die die Person zugriff hat. Alle Benutzer der Plattform können
  Diagramme sehen und in ihren Diagrammen nutzen, die dieser Datenquelle zugeordnet sind. Allerdings werden immer nur
  die Daten angezeigt, auf die die jeweilige Person oder die Dashboardgruppe Zugriff hat.
- Weitere Datenquellen, die sich aus den [Datensätzen](filemanager.md#datei-verknupfen) speisen. Diese Charts sind nur
  für Personen sichtbar, die das Projekt dieser Datenquelle sehen können.

<!-- prettier-ignore -->
!!! warning "Veraltete Diagrammtypen"
    Einige Diagrammtypen sind mit dem Schlagwort "Veraltet" versehen. Vom Benutzen dieser Diagrammtypen wird daher
    abgeraten.

<figure>
  <img src="/screenshots/superset-create-new-chart.webp" />
  <figcaption>Ein neues Chart mit Datenquelle und Diagrammtyp erstellen</figcaption>
</figure>

### Diagramm bearbeiten

Im Bearbeitungsmodus des Diagramms können die einzelnen Spalten auf die entsprechenden Felder der Abfrage gezogen
werden. Mit einem Klick auf "Diagramm erstellen" bzw. "Diagramm aktualisieren" kann die Vorschau aktualisiert und
überprüft werden.

<figure>
  <img src="/screenshots/superset-run-chart.webp" />
  <figcaption>Diagramm erstellen, nachdem die Abfrage konfiguriert wurde</figcaption>
</figure>

Zum Abschluss muss das Diagramm gespeichert werden

<figure>
  <img src="/screenshots/superset-save-chart.webp" />
  <figcaption>Diagramm speichern</figcaption>
</figure>

## SQL Lab

<figure>
  <img src="/screenshots/superset-sqllab.webp" />
  <figcaption>Übersicht über SQL Lab</figcaption>
</figure>

Das [Superset SQL Lab](https://superset.DOCS_BASE_DOMAIN/sqllab/) lässt sich innerhalb des Supersets unter `SQL` >
`SQL Lab` finden.

Es lässt sich außerdem direkt auf der Gov Hub Seite
für [veröffentlichte Abfragen](./schnittstellen/veröffentlichte-abfragen.md) aufrufen, dort allerdings nur mit
eingeschränktem Funktionsumfang.

Auf der linken Seite kann die Datenbank ausgewählt werden.

Die Datenbank `clickhouse` beinhaltet die Tabellen mit Sensordaten und deren Metadaten, [
`sensor_messages`](./schnittstellen/internes-datenmodell.md#sensor_messages), [
`sensor_meta`](./schnittstellen/internes-datenmodell.md#sensor_meta) und [
`sensor_messages_with_meta`](./schnittstellen/internes-datenmodell.md#sensor_messages_with_meta).

Die restlichen Datenbanken bilden sich aus allen Projekten, in denen der Benutzer zumindest eine Freigabe als "
Betrachter" hat. Über diese Datenbanken können Daten der jeweiligen Projekte aus dem Datei-Store (S3) lesend genutzt
werden.

Es gibt 2 Möglichkeiten, die Daten aus dem S3 abzufragen:

### Direktes Nutzen der S3-Funktion

Mit dieser Methode kann eine beliebige, kompatible Datei aus dem Datei-Store genutzt werden. So können auch Dateien
genutzt werden, für die noch kein Dataset existiert. Die entsprechende Query sieht wie folgt aus:

```sql
SELECT *
FROM s3(knuffingen.trainstation, filename = "Statistik.csv", format = "CSV")
```

Dabei muss `knuffingen.trainstation` mit dem Namen der Datenbank ersetzt werden. Die möglichen Werte für das Format sind
in der [ClickHouse-Dokumentation](https://clickhouse.com/docs/interfaces/formats) erklärt.

Eventuell können zusätzliche Einstellungen für das Format nötig sein, damit ClickHouse die Datei verarbeiten kann, z.B.
wenn eine CSV-Datei Semikolons anstelle von Kommata als Trennzeichen benutzt:

```sql
SET
format_csv_delimiter=';';

SELECT *
FROM s3(knuffingen.trainstation, filename = "Statistik.csv", format = "CSV")
```

### Nutzen eines Datensatzes

Liegt für eine Datei bereits ein Datensatz vor, kann dieser auch über die Liste
der [Datensätze in Superset](https://superset.DOCS_BASE_DOMAIN/tablemodelview/list) eingefügt werden.

<figure>
  <img src="/screenshots/superset-dataset-list.webp" />
  <figcaption>Liste der Datensätze in Superset</figcaption>
</figure>

Nach der Auswahl eines Datensatzes landet man in der Ansicht zum Erstellen eines Diagramms. Über den Menüpunkt direkt
neben dem Datensatz `...` > `In SQL Lab anzeigen` öffnet sich das SQL Lab mit dem gewünschten Datensatz bereits
vorausgefüllt.

<figure>
  <img src="/screenshots/superset-dataset-to-sqllab.webp" />
  <figcaption>Den aktuell im Diagramm ausgewählten Datensatz im SQL Lab anzeigen</figcaption>
</figure>

### Nützliche SQL Queries

```sql title="Datum des letzten Dateneingangs pro Sensor"
SELECT sensor_id, max(time)
FROM sensor_messages
GROUP BY sensor_id;
```

```sql title="Anzahl Daten pro Sensor"
SELECT sensor_id, count(1)
FROM sensor_messages
GROUP BY sensor_id;
```

```sql title="Sensoren ohne Metadaten finden"
SELECT DISTINCT sensor_id
FROM sensor_messages
WHERE sensor_id IS NOT NULL
  AND sensor_id NOT IN (SELECT DISTINCT sensor_id FROM sensor_meta);
```
