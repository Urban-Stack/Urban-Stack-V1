# City Tools

City Tools ermöglichen es, flexible Anwendungen mit individuellen Funktionen bereitzustellen. Dabei ist zu beachten, dass es zwei unterschiedliche Arten gibt, wie City Tools installiert werden können, die unterschiedliche Use Cases abdecken und daher auch unterschiedlichen Funktionalitäten und Beschränkungen unterworfen sind.

## Static Apps

Static Apps sind City Tools, die nur aus einer statischen Anwendung bestehen und im Browser der Nutzenden laufen. Da es sich ausschließlich um statische Webanwendungen handelt, können keine Eingabedaten gespeichert werden. Diese Art der City Tools ist somit für Anwendungen geeignet, die rein lesend bedient werden können, wie z.B. das Masterportal.

Static Apps werden pro Mandant installiert, dies ist Admins des Mandanten über den Menüpunkt "City Tools" in Gov Hub möglich. Danach können die Apps für den Mandanten konfiguriert werden, wobei die Konfigurationsmöglichkeiten von der Static App abhängig sind.

Im Gov Hub werden alle Static Apps angezeigt mit der Information, ob sie für diesen Mandanten installiert sind oder nicht. Falls die App installiert ist, kann diese aus dem Gov Hub aufgerufen werden.

Für jede Static App ist konfiguriert, ob diese im Citizen Hub angezeigt werden soll. Wenn ja, erscheint die installierte App öffentlich im Citizen Hub und kann genutzt werden. Die App öffnet sich beim Klick in einem separaten Browser Tab.

## Shared Apps

Shared Apps sind City Tools, die aus einer dynamischen Webanwendung bestehen. Sie besitzen die Möglichkeit Daten in einer Datenbank und im Dateisystem zu persistieren.

Die Anwendung wird nicht pro Mandant installiert, sondern von einem einzelnen Mandanten installiert und damit allen zur Verfügung gestellt. Die Shared App wird für alle Nutzenden im Gov Hub unter dem Menüpunkt "City Tools" angezeigt, kann aber nur vom Mandanten gelöscht werden, der die Shared App installiert hat und somit verantwortlich ist. Jede Shared App hat eine E-Mail-Adresse, die bei Fehlern in der App kontaktiert werden kann. Nur Admins eines Mandanten können Shared Apps installieren, löschen und Fehlerprotokolle einsehen.

Die Webanwendung in der Shared App läuft durchgängig, ist allerdings nicht hochverfügbar und wird ca. einmal im Monat durch das Kubernetes-Update neugestartet.

Die App kann Nutzende des Gov Hubs über die Single-Sign-On (SSO) Schnittstelle authentifizieren und autorisieren. Die App hat einfachen Zugriff auf Name und E-Mail der Person, sowie auf die Mandanten, in denen die Person Mitglied ist und welche Mandanten die Person administrieren darf.

Die Apps können anhand dieser Information eine Konfiguration pro Mandant ermöglichen, z.B. indem im Raumplanungstool festgelegt wird, welche Räume es für einen Mandanten gibt. Auch kann das über die SSO Schnittstelle erhaltene Token genutzt werden, um auf die APIs der Plattform ([Ressourcen-API](./schnittstellen/graphql.md), [S3-Buckets](./schnittstellen/buckets.md)) mit den Berechtigung des Angemeldeten zuzugreifen.
