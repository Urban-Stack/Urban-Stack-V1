# Berechtigungsverwaltung im Gov Hub

Die Berechtigungsverwaltung im [Gov Hub](https://govhub.DOCS_BASE_DOMAIN/) findet sich unter [Einstellungen](https://govhub.DOCS_BASE_DOMAIN/settings).

## Benutzergruppen

Nutzende können nur über [Benutzergruppen](https://govhub.DOCS_BASE_DOMAIN/settings/usergroups) Rechte an Dashboardgruppen und Projekten zugeordnet werden. Unter diesem Menüpunkt können mit den entsprechenden Berechtigungen Benutzergruppen erstellt, gelöscht und Berechtigungen vergeben werden. Außerdem können Benutzergruppen mit allen anderen Mandanten "geteilt" werden, sodass andere Mandanten dieser Gruppe Berechtigungen an ihren Projekten geben kann.

### Benutzergruppen-Übersichtsseite

Die Benutzergruppen "Admin" und "Read" werden automatisch erzeugt. Mitglieder der "Admin" Gruppe haben Vollzugriff auf den gesamten Mandanten, können also alles lesen und bearbeiten. Mitglieder der "Read" Gruppe haben vollen Lesezugriff, können also alle Dashboards und Projekte mit deren Daten lesen, aber keine Veränderungen vornehmen.

<!-- prettier-ignore -->
!!! warning "Sicherheitshinweis"
    Berechtigungen auf dem gesamten Mandanten (mit den Benutzergruppen "Admin" und "Read") sollten sparsam und mit großer Sorgfalt vergeben werden!

<figure>
  <img src="/screenshots/ugh-settings-groups-admin.webp" />
  <figcaption>Übersicht der Benutzergruppen als Admin</figcaption>
</figure>

### Benutzergruppen anlegen

Nur Administratoren des Mandanten können Benutzergruppen anlegen und auch wieder löschen.

Über die Schaltfläche "Neue Benutzergruppe" kann eine neue Benutzergruppe angelegt werden.

<figure>
  <img src="/screenshots/ugh-settings-create-group.webp" />
  <figcaption>Anlegen einer neuen Benutzergruppe</figcaption>
</figure>

#### Benutzergruppen verwalten

Weitere Funktionalitäten sind nur dann verfügbar, wenn man Admin-Berechtigungen auf einer Benutzergruppe hat. Durch das Anklicken der Gruppe gelangt man zur [Benutzergruppen-Detailansicht](#benutzergruppen-detailansicht). Es ist möglich, nur auf einem Teil der Gruppen administrativ berechtigt zu sein. Administratoren des Mandanten haben auf allen Benutzergruppen Admin-Berechtigungen.

Ob eine Benutzergruppe "Geteilt" ist legt fest, ob andere Mandanten diese Benutzergruppe sehen können und damit Berechtigungen an diese vergeben können. Diese Funktion ist relevant, wenn mandantenübergreifend an Daten oder Dashboards gearbeitet werden soll.

#### Benutzer in Benutzergruppen verwalten

Die Zuordnung von Benutzern zu Benutzergruppen wird in Keycloak vorgenommen.

<figure>
  <img src="/screenshots/ugh-settings-group-to-keycloak.webp" />
  <figcaption>Link zur Benutzergruppenverwaltung im Keycloak</figcaption>
</figure>

Um einen Benutzer zu einer Benutzergruppe hinzuzufügen muss auf den Reiter "Mitglieder" geklickt werden und dann über "Add member" die entsprechenden Benutzer ausgewählt werden. Mit einem Klick auf "Hinzufügen" wird der Vorgang abgeschlossen.

<figure>
  <img src="/screenshots/keycloak-group-admin-to-members.webp" />
  <figcaption>"Mitglieder" Reiter der Gruppenverwaltung</figcaption>
</figure>

<figure>
  <img src="/screenshots/keycloak-group-admin-add-members.webp" />
  <figcaption>Benutzer zur Gruppe hinzufügen</figcaption>
</figure>

<figure>
  <img src="/screenshots/keycloak-group-admin-confirm-members.webp" />
  <figcaption>Hinzufügen bestätigen</figcaption>
</figure>

Um Benutzer wieder zu entfernen, muss über das Aktionsmenü auf "Verlassen" geklickt werden.

<!-- prettier-ignore -->
!!! warning "Wichtiger Hinweis"
    Wird ein Benutzer aus der letzten gemeinsamen Gruppe entfernt, kann diese Person aus Datenschutzgründen nicht mehr gefunden werden und damit auch nicht mehr zu Gruppen hinzugefügt werden.

    Eine Person sollte daher erst einer neuen Gruppe hinzugefügt werden, bevor sie aus einer anderen Gruppe entfernt wird.

<figure>
  <img src="/screenshots/keycloak-group-admin-remove-user.webp" />
  <figcaption>Benutzer von der Gruppe entfernen</figcaption>
</figure>

### Benutzergruppen-Detailansicht

In der Detailansicht kann die Gruppe mit allen anderen Mandanten geteilt oder gelöscht werden.

#### Benutzergruppe teilen

Beim Teilen einer Benutzergruppe wird diese für alle anderen Mandanten sichbar gemacht. Dies dient zur mandantenübergreifenden Zusammenarbeit, da so Projekte und Dashboardgruppen für diese Benutzergruppe freigegeben werden können, auch wenn diese anderen Mandanten gehören.

<figure>
  <img src="/screenshots/ugh-settings-share-group-public.webp" />
  <figcaption>Benutzergruppe für alle Mandanten sichtbar machen</figcaption>
</figure>

#### Danger Zone

In der "Danger Zone" besteht für Administratoren des Mandanten die Möglichkeit, die Benutzergruppe zu löschen.

<!-- prettier-ignore -->
!!! danger "Bitte beachten!"
    Diese Aktion kann nicht rückgängig gemacht werden!

## Projekte

[Projekte](https://govhub.DOCS_BASE_DOMAIN/settings/projects) dienen der Datenabstraktion.

### Projekt-Übersichtsseite

Auf der Projekt-Übersichtsseite werden alle Projekte angezeigt, die der aktuell angemeldete Benutzer sehen darf, auch wenn es Projekte von einem fremden Mandanten sind. Zusätzlich wird die Berechtigung des aktuellen Benutzers auf jedes Projekt angezeigt:

- "Mitarbeiter" bedeutet Schreibzugriff auf das Projekt. Die [Projekt-Detailansicht](#projekt-detailansicht) kann durch das Anklicken des Projektes aufgerufen werden, wo die Freigaben dieses Projektes an Dashboardgruppen und Benutzergruppen eingesehen und verwaltet werden können. Außerdem können Subscriptions und Credentials verwaltet werden.
- "Betrachter" bedeutet reinen Daten-Lesezugriff, es besteht kein Zugriff auf die Detailansicht.

<figure>
  <img src="/screenshots/ugh-settings-projects-admin.webp" />
  <figcaption>Übersicht der Projekte als Admin</figcaption>
</figure>

<figure>
  <img src="/screenshots/ugh-settings-projects-normal.webp" />
  <figcaption>Übersicht der Projekte als Betrachter mit eingeschränkten Berechtigungen</figcaption>
</figure>

#### Projekte anlegen

Über die Schaltfläche "Neues Projekt" kann ein neues Projekt angelegt werden, diese Aktion kann allerdings nur von einem Administratoren des Mandanten durchgeführt werden.

<figure>
  <img src="/screenshots/ugh-settings-create-project.webp" />
  <figcaption>Anlegen eines neuen Projektes</figcaption>
</figure>

### Projekt-Detailansicht

Die Projekt-Detailansicht ist nur für Benutzer zugänglich, die "Mitarbeiter"-Berechtigungen auf diesem Projekt besitzen.

#### Freigabe Benutzergruppen

In diesem Reiter sieht man alle Benutzergruppen, für die dieses Projekt freigegeben ist. Hier kann ausgewählt werden, ob eine Gruppe "Mitarbeiter" oder "Betrachter"-Berechtigungen auf dieses Projekt haben soll. Welche Auswirkungen die einzelnen Berechtigungsstufen haben, ist [weiter oben](#projekt-ubersichtsseite) erläutert.

Um eine Freigabe zu erstellen klickt man auf die Schaltfläche "Freigeben". Danach kann man die Benutzergruppe auswählen, für die dieses Projekt freigegeben werden soll, sowie die Berechtigungsstufe. Mit einem Klick auf "Freigeben" wird die Freigabe erstellt, die sogleich in der Liste auftaucht.

<figure>
  <img src="/screenshots/ugh-settings-project-user-groups.webp" />
  <figcaption>Projekt an Benutzergruppe freigeben</figcaption>
</figure>

Um eine Freigabe wieder zu entfernen klickt man auf das "Berechtigung entfernen"-Symbol in der entsprechenden Tabellenzeile.

<figure>
  <img src="/screenshots/ugh-settings-project-remove-share.webp" />
  <figcaption>Freigabe entfernen</figcaption>
</figure>

Außerdem ist es möglich, die Berechtigung einer Freigabe zu ändern. Dafür klickt man auf die aktuelle Berechtigung (also "Betrachter" oder "Mitarbeiter") und wählt im sich öffnenden Popover die neue Berechtigung aus und bestätigt die Änderung mit einem Klick auf "Speichern".

<figure>
  <img src="/screenshots/ugh-settings-project-change-permission.webp" />
  <figcaption>Freigabe ändern</figcaption>
</figure>

#### Freigabe Dashboardgruppen

In diesem Reiter sieht man alle Dashboardgruppen, für die dieses Projekt freigegeben ist. Freigaben an Dashboardgruppen sind immer rein lesend, sodass es nicht nötig ist, eine Berechtigung auszuwählen.

Eine Projekt-Freigabe an eine Dashboardgruppe bedeutet, dass alle Dashboards dieser Dashboardgruppe auf die Sensordaten der `sensor_messages`-Tabelle und auf alle Datensätze zugreifen können, die diesem Projekt zugeordnet sind.

Um eine Freigabe zu erstellen klickt man auf die Schaltfläche "Freigeben". Danach kann man die Dashboardgruppe auswählen, für die dieses Projekt freigegeben werden soll. Mit einem Klick auf "Freigeben" wird die Freigabe erstellt, die sogleich in der Liste auftaucht.

<figure>
  <img src="/screenshots/ugh-settings-project-viz-groups.webp" />
  <figcaption>Projekt an Dashboardgruppen freigeben</figcaption>
</figure>

Um eine Freigabe wieder zu entfernen klickt man auf das "Berechtigung entfernen"-Symbol in der entsprechenden Tabellenzeile.

<figure>
  <img src="/screenshots/ugh-settings-project-remove-share-to-viz-group.webp" />
  <figcaption>Freigabe entfernen</figcaption>
</figure>

#### Subscriptions

In diesem Reiter werden MQTT-Subscriptions angelegt und verwaltet. Genauere Informationen finden sich in der [Anleitung zum Anlegen eines Lorawan-Sensors](./lorawan-sensoren-anlegen.md#abfrage-der-daten-durch-subscriptions).

#### Credentials

In diesem Reiter können Credentials angelegt werden, die zum Senden von Sensordaten an die Plattform benötigt werden.

#### Sensor-Meta-Daten

In diesem Reiter können Sensor-Meta-Daten verwaltet werden. Genauere Informationen finden sich in der [Anleitung zum Hochladen von Meta-Daten](https://govhub.DOCS_BASE_DOMAIN/meta-data-upload).

#### Danger Zone

In der "Danger Zone" besteht für Administratoren des Mandanten die Möglichkeit, das Projekt zu löschen.

<!-- prettier-ignore -->
!!! danger "Bitte beachten!"
    Diese Aktion kann nicht rückgängig gemacht werden! Alle Sensordaten dieses Projektes sowie alle Daten, die sich im S3-Bucket dieses Projektes befinden werden gelöscht und können nicht wiederhergestellt werden!

## Dashboardgruppen

[Dashboardgruppen](https://govhub.DOCS_BASE_DOMAIN/settings/dashboardgroups) dienen zur Gruppierung von Dashboards, alle Dashboard sind genau einer Dashboardgruppe untergeordnet und erben somit deren Berechtigungen.

### Dashboardgruppen-Übersichtsseite

Auf der Dashboardgruppen-Übersichtsseite werden alle Dashboardgruppen angezeigt, die der aktuell angemeldete Benutzer sehen darf, auch wenn es Dashboardgruppen von einem fremden Mandanten sind. Zusätzlich wird die Berechtigung des aktuellen Benutzers auf jede Dashboardgruppe angezeigt:

- "Mitarbeiter" bedeutet Schreibzugriff auf alle Dashboards dieser Dashboardgruppe, die somit bearbeitet und auch gelöscht werden können. Es können auch neue Dashboards angelegt werden. Die [Dashboardgruppen-Detailansicht](#dashboardgruppen-detailansicht) kann durch das Anklicken der Dashboardgruppe aufgerufen werden, wo die Freigaben dieser Dashboardgruppe an Benutzergruppen eingesehen und verwaltet werden können.
- "Betrachter" bedeutet reinen Dashboard-Lesezugriff, es besteht kein Zugriff auf die Detailansicht.

<figure>
  <img src="/screenshots/ugh-settings-viz-groups-admin.webp" />
  <figcaption>Übersicht der Dashboardgruppen als Admin</figcaption>
</figure>

<figure>
  <img src="/screenshots/ugh-settings-viz-groups-normal.webp" />
  <figcaption>Übersicht der Dashboardgruppen als Betrachter mit eingeschränkten Berechtigungen</figcaption>
</figure>

#### Dashboardgruppen anlegen

Über die Schaltfläche "Neue Dashboardgruppe" kann eine neue Dashboardgruppe angelegt werden, diese Aktion kann allerdings nur von einem Administratoren des Mandanten durchgeführt werden.

<figure>
  <img src="/screenshots/ugh-settings-create-viz-group.webp" />
  <figcaption>Anlegen einer neuen Dashboardgruppe</figcaption>
</figure>

### Dashboardgruppen-Detailansicht

Die Dashboardgruppen-Detailansicht ist nur für Benutzer zugänglich, die "Mitarbeiter"-Berechtigungen auf dieser Dashboardgruppe besitzen.

#### Freigabe Benutzergruppen

In diesem Reiter sieht man alle Benutzergruppen, für die diese Dashboardgruppe freigegeben ist. Hier kann ausgewählt werden, ob eine Benutzergruppe "Mitarbeiter" oder "Betrachter"-Berechtigungen auf dieser Dashboardgruppe haben soll. Welche Auswirkungen die einzelnen Berechtigungsstufen haben, ist [weiter oben](#dashboardgruppen-ubersichtsseite) erläutert.

Um eine Freigabe zu erstellen klickt man auf die Schaltfläche "Freigeben". Danach kann man die Benutzergruppe auswählen, für die diese Dashboardgruppe freigegeben werden soll, sowie die Berechtigungsstufe. Mit einem Klick auf "Freigeben" wird die Freigabe erstellt, die sogleich in der Liste auftaucht.

<figure>
  <img src="/screenshots/ugh-settings-viz-group-user-groups.webp" />
  <figcaption>Dashboardgruppe an Benutzergruppe freigeben</figcaption>
</figure>

Um eine Freigabe wieder zu entfernen klickt man auf das "Berechtigung entfernen"-Symbol in der entsprechenden Tabellenzeile.

<figure>
  <img src="/screenshots/ugh-settings-viz-group-remove-share.webp" />
  <figcaption>Freigabe entfernen</figcaption>
</figure>

Außerdem ist es möglich, die Berechtigung einer Freigabe zu ändern. Dafür klickt man auf die aktuelle Berechtigung (also "Betrachter" oder "Mitarbeiter") und wählt im sich öffnenden Popover die neue Berechtigung aus und bestätigt die Änderung mit einem Klick auf "Speichern".

<figure>
  <img src="/screenshots/ugh-settings-viz-group-change-permission.webp" />
  <figcaption>Freigabe ändern</figcaption>
</figure>

#### GeoJSON

Im Reiter GeoJSON können Queries erstellt, geändert und gelöscht werden. Dies ist im [Kapitel Veröffentlichte Abfragen](./schnittstellen/veröffentlichte-abfragen.md) dokumentiert.

#### Dashboards

Hier werden alle aktuell in der Dashboardgruppe existierenden Dashboards angezeigt. Verwaltet werden diese über den Menüpunkt [Dashboards](https://govhub.DOCS_BASE_DOMAIN/dashboards), dies ist im Kapitel [Dashboards](./superset.md#dashboard-detailansicht) dokumentiert.

#### Danger Zone

In der "Danger Zone" besteht für Administratoren des Mandanten die Möglichkeit, die Dashboardgruppe zu löschen.

<!-- prettier-ignore -->
!!! danger "Bitte beachten!"
    Das Löschen einer Dashboardgruppe löscht alle Dashboards und GeoJSON Queries dieser Dashboardgruppe. Diese Aktion kann nicht rückgängig gemacht werden!
