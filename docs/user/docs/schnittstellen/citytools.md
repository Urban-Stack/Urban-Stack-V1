# Schnittstellen externer City Tools

City Tools müssen als Docker-Images verpackt sein und in einer Registry liegen, die vom Internet erreichbar ist. Die Registry kann durch ein Passwort geschützt sein, welches beim Erstellen des externen City Tools angegeben werden muss.

Das City Tool muss einen HTTP-Server auf Port 3000 bereitstellen. Dieser muss die Endpunkte `/livez` und `/readyz` bereitstellen, um eine Liveness und Readiness Überwachung durch Kubernetes zu ermöglichen. In der einfachsten Implementierung geben diese Endpunkte einfach einen HTTP-Status von 200 (OK) zurück.

Der Container des City Tools muss mit einem Readonly-Filesystem und ohne Root-Rechte oder sonstige erweiterte Berechtigungen lauffähig sein. Dies dient der Sicherheit des Kubernetes-Clusters.

Um eine Überlastung des Clusters zu verhindern, ist der Container auf 400 mCPU gedrosselt und auf einen maximalen Arbeitsspeicher von 200 Mebibyte beschränkt.

Es werden folgende Environment Variablen zur Verfügung gestellt:

- `DB_HOST` der Hostname, unter dem die Postgres-Datenbank erreichbar ist
- `DB_PORT` der Port, unter dem die Postgres-Datenbank erreichbar ist
- `DB_PASSWORD` das Passwort, unter dem die Postgres-Datenbank erreichbar ist
- `DB_DATABASE` der Name des Postgres-Datenbank dieses City Tools
- `AUTH_KEYCLOAK_ISSUER` der Issuer zur Integration in den OAuth2/OIDC-Flow der Plattform
- `AUTH_KEYCLOAK_ID` die ClientID dieses City Tools, die im OAuth2/OIDC-Flow benutzt werden muss
- `HOSTNAME` (z.B. `my-citytool.my-tenant.urbanstack.de`) der Hostname, unter dem das City Tool erreichbar ist
- `RESOURCE_API_GRAPHQL` (z.B. `https://login.urbanstack.de/realms/udh/data-hub/graphql`) die URL, unter der die [GraphQL Resource API](./graphql.md) erreicht werden kann. Für die Authentifizierung gegen die API wird das `access_token` des OAuth2/OIDC-Flows benötigt.

Von der Plattform bereitgestellt werden Postgres-Datenbank (eine Datenbank pro City Tool, kein Zugriff auf andere City Tools möglich) und ein public OAuth2 Client, der für die Authentifizierung im Frontend benutzt werden kann.

Außerdem wird unter `/data` eine schreibbare und persistente Datenablage bereitgestellt, die allerdings auf 5GiB limitiert ist.

Folgende Felder werden im `access_token` und `id_token` bereitgestellt:

- `name`: Der vollständige name, z.B. `Data Hub Admin`
- `email`: Die E-Mail des Nutzers
- `tenants`: Alle Mandanten, in denen der Benutzer Mitglied ist
- `admin_tenants`: Alle Mandanten, für die der Benutzer Admin-Rechte besitzt

Authentifizierung und Authorisierung sind Aufgabe des jeweiligen City Tools.
