# Hilfsbibliothek

Eine Hilfsbibliothek zur einfachen Integration mit Plattform-APIs ist in JupyterLab als `import _` verfügbar
und kann für lokale Entwicklung [hier](/snippet/library.py) heruntergeladen werden.

Verwendungsbeispiele für Storage Buckets und GraphQL finden sich in den jeweiligen Unterseiten:

- [Storage Buckets](buckets.md#hilfsbibliothek)
- [GraphQL](graphql.md#hilfsbibliothek)

## Verwendungsbeispiel Sensormeta-API

Über die in JupyterLab integrierte [Hilfsbibliothek](#hilfsbibliothek) kann ein Authentifizierter Rest-Client für die Sensormeta-API erstellt werden:

```py title="Login"
from _ import login
auth = login()
```

Nachdem Sie den oben genannten Code ausführen, wird in der Ausgabe ein Authentifizierungslink angezeigt:

```log
Log in at https://login.DOCS_BASE_DOMAIN/realms/udh/device?user_code=XXXX-XXXX
```

Klicken Sie auf den Link. Sie werden gefragt ob Sie sich mit den angezeigten Berechtigungen Authentifizieren möchten.
Nach einer erfolgreichen Authentifizierung wird `Login successful` unterhalb des Links in der Ausgabe angezeigt.

Es gibt folgende Funktionen die Sie nach der Authentifizierung ausführen können:

```py title="Anzahl an Metadaten abrufen"
def check(tenant: str, project: str):
    """Returns the count of available sensor metadata in JSON

    :param tenant: tenant name or ID
    :param project: project name or ID
    """

auth.sensormeta.check("mandant", "projekt")

# Beispiel Ausgabe:
# {'count':3}
```

```py title="Metadaten löschen"
def delete(tenant: str, project: str):
    """Deletes all sensor metadata of a project

    :param tenant: tenant name or ID
    :param project: project name or ID
    """

auth.sensormeta.delete("mandant", "projekt")

# Ausgabe als HTTP-Code, z.B. 204 (Erfolgreich)
```

```py title="Metadaten hochladen"
def upload(tenant: str, project: str, csv_path: str):
    """Uploads a csv table to the database

    :param tenant: tenant name or ID
    :param project: project name or ID
    :param csv_path: path relative to current file to the csv file
    """

auth.sensormeta.upload("mandant", "projekt", "Pfad zur CSV Datei -> ./1.csv")

# Ausgabe bei erfolgreichem hochladen: {}
```

```py title="Metadaten herunterladen (als CSV)"
def download(tenant: str, project: str):
    """Downloads the current sensor metadata as an
        csv and saves it under "/downloads"

    :param tenant: tenant name or ID
    :param project: project name or ID
    """

auth.sensormeta.download("mandant", "projekt")

# Beispiel Ausgabe:
# Downloading CSV for mandant/projekt
# Metadata saved under: "downloads/metadata-mandant.projekt.csv"
```

## Nutzen des "Personal Credential"

Um die Funktionen der Hilfsbibliothek auch in automatisierten Skripten nutzen zu können, gibt es die Möglichkeit, das persönliche Credential des eigenen Benutzers als Umgebungsvariablen zu übergeben.

Dazu müssen die Umgebungsvariablen `PERSONAL_CREDENTIAL_USERNAME` und `PERSONAL_CREDENTIAL_PASSWORD` gesetzt werden.

Beispiel in JupyterHub:

```python
%env PERSONAL_CREDENTIAL_USERNAME=<your-credential-username-here>
%env PERSONAL_CREDENTIAL_PASSWORD=<your-credential-password-here>

from _ import login
auth = login() # <- Nutzt Umgebungsvariablen für Login-Abfrage
```

<!-- prettier-ignore -->
!!! warning "Achtung!"
    Das Setzen von Umgebungsvariablen ist System- und Umgebungsspezifisch. Dies ist nur ein Beispiel für die Verwendung innerhalb des JupyterHubs.

Das eigene "Personal Credential" lässt sich durch folgende [GraphQL-Abfrage](./graphql.md) herausfinden:

```graphql
query {
	personalCredential {
		username
		password
	}
}
```

Um das eigene "Personal Credential" zu rotieren muss folgende Mutation verwendet werden:

```graphql
mutation {
	rotatePersonalCredential {
		username
		password
	}
}
```

<!-- prettier-ignore -->
!!! danger "Bitte beachten!"
    Das alte "Personal Credential" wird durch das Rotieren ungültig und kann nicht mehr verwendet werden!
