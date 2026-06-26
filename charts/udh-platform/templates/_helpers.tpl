{{- define "data-hub.name" -}}
{{- $name := .name | required "name is required" -}}
{{- join "-" (list .prefix (include "common.names.fullname" .context) $name) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "udh.secret" -}}
{{ (get ((lookup "v1" "Secret" $.Release.Namespace (printf "%s-%s" (include "common.names.fullname" $) .name)).data | default dict) (.key | default .name)) | b64dec | default (randAlphaNum 32) }}
{{- end -}}

{{- define "udh.secretManifest" -}}
---
apiVersion: v1
kind: Secret
type: Opaque
metadata:
  name: {{ printf "%s-%s" (include "common.names.fullname" $) .name | quote }}
data:
  {{ .key | default .name }}: {{ .value | b64enc | quote }}
{{- end -}}

{{- define "udh.ingress.annotations" -}}
{{ merge (deepCopy .context.Values.global.ingress.annotations) .annotations | toYaml }}
{{- end -}}

{{- define "udh.babashkaContainer" -}}
name: babashka
image: {{ include "common.images.image" (dict "imageRoot" .context.Values.global.babashka.image "global" .context.Values.global) }}
imagePullPolicy: {{ .context.Values.global.babashka.image.pullPolicy }}
command:
  - bb
  - | {{- .context.Files.Get .script | nindent 6 }}
env:
  {{- include (print "udh.babashkaContainer.env-" .script) (dict "context" .context) | nindent 2 }}
  - name: INSECURE_SSL_SKIP_VERIFY
    value: {{ .context.Values.global.sslInsecureSkipVerify | quote }}
resources:
  requests:
    memory: 32Mi
    cpu: 50m
  limits:
    memory: 128Mi
{{- end -}}

{{- define "udh.kafka.cluster" -}}
{{ printf "%s-kafka" (include "common.names.fullname" .) }}
{{- end -}}

{{- define "udh.kafka.host" -}}
{{ include "data-hub.name" (dict "context" . "name" "kafka-kafka-bootstrap") }}
{{- end -}}

{{- define "udh.kafka.env" -}}
- name: KAFKA_HOST
  value: {{ include "udh.kafka.host" . }}
{{- end -}}

{{- define "udh.rook-ceph-bucket.service" -}}
http://rook-ceph-rgw-
{{- if .Values.objectStorage.reuseClusterFromNamespace -}}
{{ printf "ns-%s" .Release.Namespace }}.{{ .Values.objectStorage.reuseClusterFromNamespace }}
{{- else -}}
bucket.{{ .Release.Namespace }}
{{- end -}}
{{- end -}}

{{- define "udh.keycloak.realmUrl" -}}
https://{{ include "data-hub.keycloak.hostname" . }}/realms/{{ .Values.keycloak.realm }}
{{- end -}}

{{- define "udh.keycloak.citizenhub.realmUrl" -}}
https://{{ include "data-hub.keycloak.hostname" . }}/realms/{{ .Values.keycloak.citizenhub.realm }}
{{- end -}}

{{- define "udh.clickhouse.env.admin" -}}
- name: CLICKHOUSE_HOST
  value: {{ include "data-hub.name" (dict "context" . "name" "clickhouse" "prefix" "clickhouse") }}
- name: CLICKHOUSE_USERNAME
  value: admin
- name: CLICKHOUSE_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ include "data-hub.name" (dict "context" . "name" "clickhouse-users") }}
      key: pwdAdmin
{{- end -}}
{{- define "udh.clickhouse.env.queryonly" -}}
- name: CLICKHOUSE_HOST
  value: {{ include "data-hub.name" (dict "context" . "name" "clickhouse" "prefix" "clickhouse") }}
- name: CLICKHOUSE_USERNAME
  value: queryonly
- name: CLICKHOUSE_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ include "data-hub.name" (dict "context" . "name" "clickhouse-queryonly") }}
      key: clickhouse-queryonly
{{- end -}}

{{- define "udh.shared-apps-namespace" -}}
{{ .Values.sharedAppsNamespace | default .Release.Namespace }}
{{- end -}}

{{- define "udh.dedicated-apps-namespace" -}}
{{ .Values.dedicatedAppsNamespace | default .Release.Namespace }}
{{- end -}}