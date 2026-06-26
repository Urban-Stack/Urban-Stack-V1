# CKAN Berechtigungsmanagement

Die Integration von CKAN in das Berechtigungsmanagement wird sowohl von der `keycloak-extension` als auch von einer Anpassung des `ckanext-keycloak`-Plugins sichergestellt:

In der `udh-sync` `keycloak-extension` wurde die Funktion `setClaimsCkan` implementiert, die an den `groups`-Claim eine Liste mit allen Mandanten und den entsprechenden CKAN-Berechtigungen des Nutzers schreibt. Es werden folgende 3 Berechtigungen genutzt: `ckan-member`, `ckan-editor` und `ckan-admin`. Beispiel-Claim: `"groups": ["mandant1.ckan-member", "mandant1.ckan-editor", "mandant2.ckan-member"]`. Ein Mandant kann mehrfach in der Liste auftauchen.

Das [`ckanext-keycloak`-Plugin](https://github.com/SyeKlu/ckanext-keycloak/commits/feature-keycloak-user-permissions/) nutzt die `handle_group_memberships` Funktion, um dem Nutzer auf einem Mandanten die entsprechenden Berechtigungen zu geben. Dabei wird von `member`, `editor` und `admin` immer nur die höchste Rolle pro Mandant gesetzt, sodass für den Beispiel-Claim `"groups": ["mandant1.ckan-member", "mandant1.ckan-editor", "mandant2.ckan-member"]` eine `editor` Rolle für `mandant1` und eine `member` Rolle für `mandant2` konfiguriert wird. Hat der Benutzer in CKAN Verknüpfungen zu Mandanten, so werden diese entfernt.

Berechtigungen können nicht direkt im CKAN bearbeitet werden.
