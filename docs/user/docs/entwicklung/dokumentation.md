# Dokumentation

Die Plattformdokumentation für Benutzer, Integration, und Entwicklung erfolgt mit [mkdocs-material](https://squidfunk.github.io/mkdocs-material/).

## Screenshots

Screenshots werden automatisch im Rahmen der End-to-End-Tests erstellt, sodass Screenshots immer zum aktuellen Stand der Plattform passen.

Im Testcode ist wird hierzu die Funktion `docsScreenshot()` verwendet.

### Beispiele

<figure>
  <img src="/screenshots/ugh-dashboard-create.webp" />
  <figcaption>Screenshot mit Hervorhebung und Zuschnitt</figcaption>
</figure>

<figure>
  <img src="/screenshots/superset-alert-config.webp" />
  <figcaption>Screenshot mit Hervorhebung</figcaption>
</figure>

<figure>
  <img src="/screenshots/chart-add.webp" />
  <figcaption>Screenshot ganze Seite</figcaption>
</figure>

## Diagramme

Diagramme können mit [mermaid](https://mermaid.js.org/) erstellt werden.

````
```mermaid
flowchart LR
  A --> B;
```
````

```mermaid
flowchart LR
  A --> B;
```
