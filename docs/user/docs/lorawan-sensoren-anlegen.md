# Subscription anlegen (MQTT)

Um Daten über MQTT zu empfangen, muss als Erstes ein MQTT-Endpunkt angelegt werden.  
Dies kann im jeweiligen MQTT-Message-Broker (z. B. The Things Network) eingerichtet werden.
Um Daten mittels MQTT empfangen zu können, benötigen Sie die folgenden Informationen Ihres MQTT-Endpunkts:

- URI (spezifiziert mit Protokoll e.g. mqtts://example.domain:8883)
- Topic (z. B. `v3/{application_id}@{tenant_id}/devices/{device_id}/up`)
- Username (Message-Broker-spezifisch z. B. example@ttn)
- Passwort / Token

In der The Things Network-Konsole finden Sie die MQTT-Endpunktinformationen unter:

`Applications > 'Ihr Applikationsname' > End devices > 'Ihr Gerätename' > Other Integrations > MQTT`  
![TheThingsNetwork – MQTT Credentials](./screenshots_manuell/ttn_mqtt_credentials.png 'TheThingsNetwork, MQTT-Endpunktinformationen')

<!-- prettier-ignore -->
!!! info "Hinweis"
    Topics können unterschiedliche Formate haben, die sich je nach Message-Broker unterscheiden. Ein Topic bei The Things Network ist wie folgt aufgebaut: `v3/{application_id}@{tenant_id}/devices/{device_id}/up`  
    Informationen über das genutzte Topic-Format finden Sie meist auf der Internet-Seite Ihres genutzten Message-Brokers.

<!-- prettier-ignore -->
!!! warning "Achtung"
    Es wird empfohlen MQTTs (MQTT mit TLS) zu nutzen, da die übertragenen Daten ansonsten nicht verschlüsselt sind!

## Abfrage der Daten durch Subscriptions

Um die Daten des MQTT-Endpunkts abfragen zu können, müssen Sie eine Subscription innerhalb Ihres Projekts einrichten. Öffnen Sie den GovHub unter [`https://govhub.DOCS_BASE_DOMAIN/`](https://govhub.DOCS_BASE_DOMAIN/) und navigieren Sie zum Menüpunkt:

`Einstellungen > Projekte > 'Ihr Projektname' > Subscriptions`

<figure>
  <img src="/screenshots/create-new-mqtt-subscription.webp" />
  <figcaption>Subscriptions des Projekts </figcaption>
</figure>

- Erstellen Sie eine neue Subscription, indem Sie auf `+ Neue Subscription` klicken.
- Vergeben Sie einen Namen für Ihre Subscription, um sie identifizieren zu können.
- Fügen Sie die Endpunkt-URI, die Sie zuvor von Ihrem MQTT-Message-Broker erhalten haben, hier ein.
- Spezifizieren Sie Ihr MQTT-Topic.
- Wählen Sie das gewünschte Format aus (z. B. Lorawan für TheThingsNetwork-Lorawan-Sensoren, Zenner für die Zenner Plattform).
- Hinterlegen Sie den Benutzernamen und das Passwort, welches Sie von Ihrem MQTT-Message-Broker erhalten haben.

Speichern Sie Ihre Subscription abschließend, indem Sie auf den `Speichern`-Knopf drücken:

<figure>
  <img src="/screenshots/ugh-mqtt-subscription.webp" />
  <figcaption>Ausgefüllte Subscription </figcaption>
</figure>

## Subscription-Formate

Der GovHub unterstützt verschiedene Subscription-Formate. Je nach genutztem MQTT-Message-Broker können Sie ein anderes Format auswählen. Für einen Lorawan-Wettersensor wie dem `SMC30 - Senstick Microclimate` können Sie das `Lorawan`-Format nutzen. Haben Sie einen Sensor über die Zenner-Plattform angelegt können Sie das `Zenner`-Format nutzen.

## Freigabe der empfangenen Daten

Nachdem Sie eine MQTT-Subscription eingerichtet haben werden die Daten nun auf Projektebene abgespeichert.
Die empfangenen Daten können für verschiedene Benutzer oder Dashboards der Plattform freigegeben werden.
Dafür können Berechtigungen zum Lesen und Bearbeiten der Daten vergeben werden.

## Freigabe von Zugriff auf Projektdaten an Benutzergruppe

Als ersten Schritt müssen die Projektdaten für eine Benutzergruppe freigegeben werden. Jeder Benutzer, der sich in dieser freigegebenen Gruppe befindet, kann die Daten des Projekts einsehen. Stellen Sie daher sicher, dass sich nur Benutzer in den jeweiligen Benutzergruppen befinden, die diese Berechtigung erhalten sollen.

Um nun eine Benutzergruppe zu berechtigen, navigieren Sie zu:

`Einstellungen > Projekte > 'Ihr Projektname' > Freigabe Benutzergruppen`

<figure>
  <img src="/screenshots/share-project-data-usergroups.webp" />
  <figcaption>Freigabe von Projektdaten an Benutzergruppen</figcaption>
</figure>

- Um eine Gruppenfreigabe zu erstellen, klicken Sie auf `Freigeben`.
- Wählen Sie die Benutzergruppe aus, der Sie Zugriff auf die Projektdaten erlauben wollen.
- Wählen Sie `Betrachter`-Berechtigung aus, um lesenden Zugriff auf die Daten des Projekts zu gewähren.
- Um die Gruppenfreigabe zu speichern, drücken Sie abschließend auf `Freigeben` innerhalb des Pop-ups.

## Freigabe von Zugriff auf Projektdaten an Dashboardgruppe

Als Nächstes benötigt die Dashboardgruppe, in der Sie ein Dashboard erstellen möchten, ebenfalls lesenden Zugriff auf die Projektdaten.

Gehen Sie hierfür auf:  
`Einstellungen > Projekte > 'Ihr Projektname' > Freigabe Dashboardgruppen`

<figure>
  <img src="/screenshots/share-project-data-dashboardgroups.webp" />
  <figcaption>Freigabe von Projektdaten an Dashboardgruppen</figcaption>
</figure>
- Um eine Dashboardfreigabe zu erstellen, klicken Sie auf `Freigeben`.  
- Wählen Sie die Dashboardgruppe aus, der Sie Zugriff auf die Projektdaten erlauben wollen.  
- Um die Dashboardfreigabe zu speichern, drücken Sie abschließend auf `Freigeben` innerhalb des Pop-ups.

## Freigabe von Zugriff auf Dashboardgruppe an Benutzergruppe

Als letzten Schritt benötigt Ihre Benutzergruppe `Mitarbeiter`-Berechtigung auf Ihrer Dashboardgruppe,  
um den Mitgliedern der Benutzergruppe das Erstellen und Ändern von Dashboards zu erlauben.

Navigieren Sie hierfür zu:

`Einstellungen > Dashboardgruppen > 'Ihr Dashboardname' > Freigabe Benutzergruppen`

<figure>
  <img src="/screenshots/give-usergroup-permission-to-dashboardgroup.webp" />
  <figcaption>Freigabe von Dashboardgruppe an Benutzergruppe</figcaption>
</figure>

- Um eine Gruppenfreigabe zu erstellen, klicken Sie auf `Freigeben`.
- Wählen Sie die Benutzergruppe aus, der Sie Zugriff auf die Dashboardgruppe erlauben wollen.
- Wählen Sie `Mitarbeiter`-Berechtigung aus, um bearbeitenden Zugriff auf die Daten des Projekts zu gewähren.
- Um die Gruppenfreigabe zu speichern, drücken Sie abschließend auf `Freigeben` innerhalb des Pop-ups.

## Einsehen der empfangenen Daten über ein Dashboard-Diagramm

Um sich die empfangenen Daten nun ansehen zu können, haben Sie die Möglichkeit, ein Diagramm innerhalb eines Dashboards anzulegen.

Stellen Sie hierfür sicher, dass Sie mit einem Nutzer angemeldet sind und folgende Konfiguration vorliegt:

- Der Benutzer, mit dem Sie angemeldet sind, ist Teil einer Benutzergruppe.
- Diese Benutzergruppe muss `Betrachter`-Berechtigung auf Ihrem Projekt haben.
- Diese Benutzergruppe muss `Mitarbeiter`-Berechtigung auf eine Dashboardgruppe haben.
- Die Dashboardgruppe muss lesenden Zugriff auf Ihr Projekt haben.

Navigieren Sie danach zum Dashboard-Menü:

- Gehen Sie zum Menüpunkt `Dashboard` innerhalb der linken Seitenleiste.
- Klicken Sie auf das Dashboard, in dem Sie ein Diagramm erstellen möchten.
- Alternativ können Sie über den Knopf `Dashboard erstellen` ein weiteres Dashboard innerhalb einer Dashboardgruppe erstellen.

<figure>
  <img src="/screenshots/dashboards-overview.webp" />
  <figcaption>Dashboardübersicht</figcaption>
</figure>

- Klicken Sie auf `Dashboard bearbeiten`.
- Anschließend klicken Sie auf `Neues Diagramm erstellen` innerhalb der rechten Seitenleiste.
- Wählen Sie als Erstes den Datensatz aus, den Sie anzeigen möchten.
- Wählen Sie nun eine Diagrammart aus, beispielsweise `Balkendiagramm`.
- Nachdem Sie das Diagramm durch Klicken ausgewählt haben, drücken Sie auf `Neues Diagramm erstellen`.

<figure>
  <img src="/screenshots/chart-add.webp" />
  <figcaption>Erstellen eines Diagramms</figcaption>
</figure>

- Wenn Sie das Balkendiagramm ausgewählt haben, können Sie nun die beiden Achsen des Diagramms definieren.
- Definieren Sie zuerst die X-Achse, beispielsweise mit dem Wert „time“. Dadurch werden Ihnen die Metriken anhand eines Zeitstrahls angezeigt.
- Wählen Sie nun eine Spalte der Daten aus, die Ihr Sensor Ihnen per MQTT bereitstellt, beispielsweise `temperature_outside`.
- Klicken Sie auf `Diagramm erstellen`, um das Menü zur Speicherung des Diagramms zu öffnen.
- Um den Prozess nun abzuschließen, klicken Sie auf `Speichern` oder auf `Speichern & zum Dashboard zurückkehren`, um zu dem Dashboard zurückzugelangen.
