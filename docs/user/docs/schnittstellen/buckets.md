# Storage Buckets

Für jedes Projekt wird ein S3-kompatibler Storage Bucket zur Ablage von beliebigen Dateien nach dem Namensschema `mandant.projekt` eingerichtet.

Der Endpunkt hierfür ist `https://storage.DOCS_BASE_DOMAIN/`.

## Berechtigungen

Die Zugriffsrechte werden über die Scopes `project:bucket-read` und `project:bucket-write` konfiguriert.

Objekte mit dem Präfix `_public/` sind öffentlich lesbar unter `https://storage.DOCS_BASE_DOMAIN/mandant.projekt/_public/...`.

## Zugangsdaten

Um temporäre Zugangsschlüssel für die Storage Buckets zu erhalten wird der [AssumeRoleWithWebIdentity](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html)-Mechanismus verwendet.

Hierzu kann der ausführende Code (z.B. Python-Code in einem Jupyter Notebook) einen Token von Keycloak anfordern, der anschließend beim Storage-Endpunkt in temporäre Anmeldedaten umgetauscht werden kann.
Keycloak bittet in diesem Rahmen um die explizite Zustimmung des Benutzers, dem anfragenden Programmcode Plattformzugriff im Namen des Benutzers zu gewähren.

<!-- prettier-ignore -->
!!! danger "Achtung!"
    Es ist wichtig, dass hier nur der Anmeldung von eigens ausgeführtem Code zugestimmt wird.  
    Eine Zustimmung zur Anfrage über einen anderen Link käme der Weitergabe der Anmeldedaten gleich!

## Hilfsbibliothek

Über die in JupyterLab integrierte [Hilfsbibliothek](hilfsbibliothek.md) kann ein vorkonfigurierter [boto3](https://github.com/boto/boto3)-Client erstellt werden:

```python title="Login"
from _ import login
auth = login()
```

```
Log in at https://login.DOCS_BASE_DOMAIN/realms/udh/device?user_code=XXXX-XXXX
Still waiting for login confirmation...
Login successful
```

```python title="Objekte in Bucket auflisten"
auth.s3.list_objects(Bucket="mandant.projekt")
```
