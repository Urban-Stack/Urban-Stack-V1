# Apache Nifi

Unter [`https://nifi.DOCS_BASE_DOMAIN/`](https://nifi.DOCS_BASE_DOMAIN/) steht eine Apache Nifi-Installation bereit,
die es angemeldeten Benutzern der Plattform ermöglicht, Flows zu erstellen und auszuführen.

Diese Dokumentation ist fokussiert auf die Apache Nifi Installation im Urbanstack, weiterführende Dokumentation findet sich in der [Apache Nifi Online Dokumentation](https://nifi.apache.org/components/).

<!-- prettier-ignore -->
!!! note "Hinweis"
    Ein zentrales Feature von Apache Nifi ist es, dass immer alle Process Groups und Flows allen Benutzern (ungeachtet deren Berechtigung) angezeigt werden. Allerdings werden alle Details (wie z.B. die Art des Flows und Konfigurationseinstellungen) vor unberechtigten Personen verborgen.

## Onboarding eines Mandanten

Ziel des Onboardings eines Mandanten in Nifi ist es, eine Process Group für diesen anzulegen und eine Gruppe für den Mandanten zu erstellen, sodass alle User des Mandanten automatisch auf die Process Group berechtigt sind.

Dafür muss als erstes eine neue Gruppe über das Hauptmenü (Hamburger Menü oben rechts) > `Users` > Plus-Symbol angelegt werden. Diese Gruppe muss den internen Namen des Mandanten tragen, also z.B. `guetersloh`.

Ebenfalls im Hauptmenü, unter `Policies`, muss nun die Policy "view the user interface" der Gruppe zugewiesen werden.

Durch einen Klick auf das nifi-Logo oben links kommt man wieder auf die Startseite, dort kann nun eine neue Process Group erstellt werden, diese sollte ebenfalls den Namen des Mandanten tragen, allerdings kann hier der Anzeigename verwendet werden, also z.B. `Gütersloh`.

Durch einen Doppelklick auf die neu erstellte Process Group gelangt man in deren Ansicht. Nun können durch das Schlüssel-Symbol, welches sich auf der linken Seite im Kasten `Operation` findet, Access Policies für die Process Group vergeben werden.

Hier kann man entscheiden, welche Rechte alle Benutzer des Mandanten haben sollen und welche Rechte nur für bestimmte User vergeben werden. Weiterführende Informationen finden sich in der [Nifi Berechtigungsdokumentation](https://nifi.apache.org/nifi-docs/user-guide.html#UI-with-multi-tenant-authorization).

## Onboarding eines Administrators für Nifi

Um einzelnen Usern die Möglichkeit zu geben, selber weitere Mandanten einzurichten können diese in der User-Übersicht der "admin"-Gruppe hinzugefügt werden.

<!-- prettier-ignore -->
!!! warning "Hinweis"
    User in der "admin" Gruppe können alle Policies und alle Process Groups einsehen und verändern, dieser Gruppe sollten daher nur vertrauenswürdige Personen hinzugefügt werden!
