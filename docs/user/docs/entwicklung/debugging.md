# Debugging

Diese Seite sammelt Tipps und Snippets, die bei Debugging und Entwicklung helfen können.

## Superset

```sh title="Superset-Benutzer temporär (bis zum nächsten Login) die Admin-Rolle geben"
kubectl exec -i deploy/local-udh-platform-superset -- superset shell <<.
from superset import security_manager
from flask_appbuilder.security.sqla.models import Role
user = security_manager.find_user(email='data-hub-admin@example.com')
admin_role = security_manager.find_role('Admin')
user.roles.append(admin_role)
security_manager.get_session.commit()
.
```

### Kartendiagramme

Für die meisten Kartendiagramme nutzt Superset Mapbox, welches lokal standardmäßig deaktiviert ist.

Für eine vollständige Kartendarstellung muss in der lokalen Entwicklungsumgebung der API-Schlüssel manuell gesetzt werden, siehe `values.yaml`.

## Discourse

```sh title="Discourse-Benutzer Administratorrechte geben"
kubectl exec -i deployments/local-udh-platform-discourse -- bash -c \
'cd /opt/bitnami/discourse && RAILS_ENV=production bundle exec rails console' \
<<<'User.find_by_email("data-hub-admin@example.com").grant_admin!'
```

Alternativ können Administratorrechte über die Benutzeransicht im Administrationsbereich vergeben werden.

```sh title="Discourse Fehlermeldungen aus Redis auslesen"
kubectl exec -i deployments/local-udh-platform-discourse -- bash -c \
'cd /opt/bitnami/discourse && RAILS_ENV=production bundle exec rails console' \
<<<'Logster.store.latest'
```

## Helm-Chart / Plattform

Um das gesamte Helm-Chart zu deployen und falls noch nicht geschehen den dafür notwendigen Minikube-Cluster einzurichten wird `test-env/start.sh` verwendet.

Im Regelfall kann der Codestand nach einem Branchwechsel problemlos ausgerollt werden,
sollte dies jedoch - z.B. nach dem Testen von Updates - nicht erfolgreich sein,
kann zunächst der Plattform-Namespace gelöscht und automatisch neu erstellt werden.

```sh
test-env/kill-namespace && test-env/start.sh
```

Falls dies nicht erfolgreich ist kann der gesamte Minikube-Cluster neu erstellt werden.

```sh
minikube delete --all && test-env/start.sh
```

Wenn sich die Helm Dependencies nicht geändert haben kann `SKIP_HELM_UPDATE` gesetzt werden.
Darüber hinaus kann der Image-Build-Schritt auf ein oder mehrere Images begrenzt werden.

```sh
SKIP_HELM_UPDATE= test-env/start.sh discourse
```

Zusätzliche Helm-Optionen können über die `HELM_OPTS`-Umgebungsvariable ergänzt werden.
Dies kann auch dazu benutzt werden, Komponenten zu deaktivieren oder Einstellungen zu testen ohne die Template-Dateien zu verändern.

```sh title="HELM_OPTS für alle nachfolgenden Befehle"
export HELM_OPTS=--set=objectStorage.enabled=false
```

```sh title="HELM_OPTS für einen Befehl"
HELM_OPTS=--set=objectStorage.enabled=false test-env/start.sh
```

### Dedicated Apps

Die Charts/Docker-Images der dedicated apps liegen teilweise in anderen Repos, daher wird eine zusätzliche enc-Datei genutzt.

```sh title="Einbinden der dedicated apps für das lokale Entwickeln"
export HELM_OPTS=-f secrets://charts/udh-platform/dedicated-apps.enc.yaml
```

## Test Credentials

Die für e2e-Tests relevanten Zugangsdaten können mit `e2e/env.sh` ausgegeben werden.

## Interne Datenbank

Direkter Zugriff auf die interne PostgreSQL-Datenbank ist mit `test-env/sql-shell [db]` möglich, z.B. `test-env/sql-shell discourse`.

## Keycloak

### Administrativer Zugriff

Administrativer Keycloak-Zugriff ist unter [`https://login.data-hub.local/admin/master/console/`](https://login.data-hub.local/admin/master/console/) mit den Zugangsdaten `admin`/`adminpassword` möglich.

Die eigentliche Konfiguration erfolgt jedoch über das Helm-Chart.

### Keycloak-Erweiterungen Debuggen

Um Keycloak-Erweiterungen mit IntelliJ IDEA zu debuggen muss zunächst der Debugging Port weitergeleitet werden: `kubectl --context udp-local port-forward -n udh statefulsets/local-udh-platform-sso-keycloak 5005:5005`

Dann muss in der IDE unter "Run" > "Attach to Process..." die erste Option ausgewählt werden (beinhaltet `--features=admin-fine-grained-authz (5005)`).

## E-Mail-Empfang

Alle Entwicklungs- und Staging-Umgebungen nutzen [MailHog](https://github.com/mailhog/MailHog) um einen SMTP-Server bereitzustellen.

Dieser ist unter [`https://mailhog.data-hub.local/`](https://mailhog.data-hub.local/) mit den Zugangsdaten `admin`/`adminpassword` erreichbar.

## Entwicklungszertifikate

Die lokale Entwicklungsumgebung beinhaltet ein eigenes CA-Zertifikat, das ausschließlich für `.data-hub.local` verwendbar ist.
Dieses ist im Repository unter `docs/local-ca.crt` zu finden und kann in den Webbrowser importiert werden um Warnungen während der Entwicklung zu vermeiden.

## Kafka

Zum debuggen von Kafka wird [kafkactl](https://github.com/deviceinsight/kafkactl) empfohlen. Es wird eine `kafkaconfig.yaml` benötigt:

```
contexts:
  default:
    brokers:
      - local-udh-platform-kafka-kafka-bootstrap:9092

    kubernetes:
      enabled: true
      kubeContext: udp-local
      namespace: udh

  staging:
    brokers:
      - staging-udh-platform-kafka-kafka-bootstrap:9092

    kubernetes:
      enabled: true
      kubeContext: name@clusterid
      kubeconfig: /path/to/staging/kubeconfig
      namespace: udp-staging

  prod:
    brokers:
      - prod-udh-platform-kafka-kafka-bootstrap:9092

    kubernetes:
      enabled: true
      kubeContext: name@clusterid
      kubeconfig: /path/to/prod/kubeconfig
      namespace: udp
```

`kafkactl` spawnt einen Pod direkt neben Kafka, man muss daher die Berechtigung haben, Pods in dem entsprechenden Namespace zu erstellen.

Der kubeContext für staging und prod kann mit `cat /path/to/kubeconfig | yq -r '."current-context"'` ermittelt werden.

Aufruf von `kafkactl` um die Topic `sensor_messages_input` zu beschreiben:

```
kafkactl --config-file kafkaconfig.yaml --context default describe topic sensor_messages_input
```

Es existieren folgende Topics:

- `sensor_messages_input`: Rohe Eingangsdaten, werden vom Ingestor befüllt
- `sensor_messages`: Vom Ingestor verarbeitete Daten, die in ClickHouse abgefragt werden können

Um die letzten 400 Nachrichten der Topic `sensor_messages` anzuzeigen:

```
kafkactl --config-file kafkaconfig.yaml --context default consume sensor_messages --tail 400
```

### Kafka Deployment

Kafka wird mithilfe des [Strimzi-Operators](https://strimzi.io/docs/operators/latest/overview) betrieben.

Zur Konfiguration des Kafka-Clusters kommen die `Kafka` und `KafkaNodePool` Custom Resources zum Einsatz.

Während der Strimzi-Operator Teil des Cluster-Deployments ist, wird der Kafka-Cluster im Urbanstack Deployment mit ausgerollt.

Die Kafka Version ist abhängig von der Version des Operators, so werden Updates vereinfacht.
Die `metadataVersion` ist hingegen gepinnt, da so die einzelnen Nodes während eines Updates weiter miteinander kommunizieren können.
