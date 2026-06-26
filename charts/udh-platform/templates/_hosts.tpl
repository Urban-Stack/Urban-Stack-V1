{{- define "data-hub.keycloak.hostname" -}}
login.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.jupyterhub.hostname" -}}
jupyterhub.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.superset.hostname" -}}
superset.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.discourse.hostname" -}}
community.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.govhub.hostname" -}}
govhub.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.citizenhub.hostname" -}}
citizenhub.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.citytools.hostname" -}}
citytools.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.docs.hostname" -}}
docs.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.mailhog.hostname" -}}
mailhog.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.storage.hostname" -}}
storage.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.clickhouse.hostname" -}}
clickhouse.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.ingestor.hostname" -}}
api.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.ingestor.testmqtt.hostname" -}}
mqtt.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.pubquery.hostname" -}}
api.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.ckan.hostname" -}}
ckan.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.sensormeta.hostname" -}}
api.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.nifi.hostname" -}}
nifi.{{ .Values.global.baseDomain }}
{{- end -}}

{{- define "data-hub.zipupload.hostname" -}}
api.{{ .Values.global.baseDomain }}
{{- end -}}
