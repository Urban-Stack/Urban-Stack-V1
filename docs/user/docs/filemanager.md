# Datei-Manager

Der Datei-Manager ist ein einfach zu bedienendes Interface für den in die Plattform integrierten S3 kompatiblen Object
Store. Die dahinter liegenden technischen Aspekte sind im Kapitel [Buckets](./schnittstellen/buckets.md) dokumentiert.

Der Datei-Manager ist fest in den [Gov Hub](https://govhub.DOCS_BASE_DOMAIN/) integriert und kann über das Hauptmenü
aufgerufen werden.

<figure>
  <img src="/screenshots/govhub-file-manager.webp" />
  <figcaption>Link zum Datei-Manager</figcaption>
</figure>

## Projekt auswählen

Über das Dropdown-Menü kann das Projekt ausgewählt werden.

Ist man nur "Betrachter" auf diesem Projekt, kann man die Dateien lediglich auflisten und herunterladen.

<figure>
  <img src="/screenshots/ugh-file-manager-read-overview.webp" />
  <figcaption>Übersicht als Benutzer mit Leserechten</figcaption>
</figure>

Ist man "Mitarbeiter" auf diesem Projekt, kann man außerdem noch Dateien hochladen, löschen und diese als Dataset mit Superset verknüpfen.

<figure>
  <img src="/screenshots/ugh-file-manager-write-overview.webp" />
  <figcaption>Übersicht als Benutzer mit Schreibrechten</figcaption>
</figure>

## Datei hochladen

Zum Hochladen von Dateien muss als Erstes die Datei auf das markierte "Drag and Drop"-Feld gezogen oder durch Klicken auf dieses Feld der Dateiauswahldialog geöffnet werden.

Wurde eine Datei ausgewählt, muss dies noch mit einem Klick auf "Hochladen" bestätigt werden.

<!-- prettier-ignore -->
!!! danger "Zeichenbeschränkungen beachten!"
    Die Dateinamen der hochgeladenen Dateien lassen nicht alle Zeichen zu. Erlaubt sind nur Buchstaben, Zahlen und die Sonderzeichen `()+,.;:=@_/-`. Dateien mit anderen Sonderzeichen (z.B. `äöüß`) können **nicht** hochgeladen werden.

## Datei löschen

Eine Datei kann durch einen Klick auf das Mülleimer-Icon der entsprechenden Tabellenzeile gelöscht werden.

<figure>
  <img src="/screenshots/ugh-file-manager-delete.webp" />
  <figcaption>Schaltfläche, um eine Datei zu löschen</figcaption>
</figure>

## Datei verknüpfen

Um eine Datei als Dataset mit Superset zu verknüpfen, genügt ein Klick auf "Nicht Verknüpft" in der entsprechenden Tabellenzeile.

Wie die Datasets dort genutzt werden können findet sich in der [Dokumentation zu Superset](./superset.md#diagramm-erstellen).

Es werden nur CSV- und JSON-Dateien akzeptiert.

### CSV-Dateien

Um eine CSV-Datei verknüpfen zu können, muss diese Datei die Dateiendung `csv` aufweisen. Außerdem müssen die einzelnen Spalten durch ein Semikolon (`;`) getrennt sein. CSV-Dateien mit Komma (`,`) als Trenner können **nicht** genutzt werden sondern müssen auf ein Komma als Trennzeichen umgestellt werden.

Des Weiteren muss die Datei in jeder Zeile die gleiche Anzahl an Spalten aufweisen. Die erste Zeile sollte immer die Spaltennamen enthalten.

Sowohl das [CSVWithNames](https://clickhouse.com/docs/interfaces/formats/CSVWithNames) als auch das [CSVWithNamesAndTypes](https://clickhouse.com/docs/interfaces/formats/CSVWithNamesAndTypes) Format werden unterstützt, ClickHouse wählt automatisch das passende Format aus.

#### Beispiel

Eine Beispieldatei mit fiktiven Daten kann [hier](/snippet/csv-example.csv) heruntergeladen werden.

### JSON-Dateien

Um eine JSON-Datei verknüpfen zu können, muss diese Datei die Dateiendung `json` aufweisen. Folgende JSON-Formate sind zulässig:

```json title="Liste von Objekten"
[
    {
        "column1": 1,
        "column2": "test1"
    },
    {
        "column1": 2,
        "column2": "test2"
    },
    ...
]
```

```json title="Liste von Objekten mit Metadaten"
{
    "meta": [
        {
            "name": "column1",
            "type": "Int32"
        },
        {
            "name": "column2",
            "type": "String"
        }
    ],
    "data": [
        {
            "column1": 1,
            "column2": "test1"
        },
        {
            "column1": 2,
            "column2": "test2"
        },
        ...
    ]
}
```

Dies entspricht dem ClickHouse [JSONAsObject](https://clickhouse.com/docs/interfaces/formats/JSONAsObject) Format, alle Objekte müssen die gleichen Schlüssel besitzen.

## Dateien ersetzen

Um eine Datei zu ersetzen, die verknüpft ist, muss der Knopf zum Bearbeiten der jeweiligen Tabellenzeile genutzt werden. Dabei muss die neue Datei exakt den gleichen Dateinamen haben.

<figure>
  <img src="/screenshots/ugh-file-manager-replace-button.webp" />
  <figcaption>Schaltfläche, um die Datei eines Datasets zu ersetzen</figcaption>
</figure>

<figure>
  <img src="/screenshots/ugh-file-manager-replace-view.webp" />
  <figcaption>Modal zum Hochladen der neuen Datei</figcaption>
</figure>

<!-- prettier-ignore -->
!!! danger "Bitte beachten!"
    Ein Umbenennen oder Löschen von Spalten führt mit hoher Wahrscheinlichkeit dazu, dass die entsprechenden Charts in Superset nicht mehr korrekt funktionieren.

    Es wird empfohlen, nur *Zeilen* hinzuzufügen oder zu entfernen.
