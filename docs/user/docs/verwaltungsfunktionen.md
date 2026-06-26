# Verwaltungsfunktionen

## Benutzer-Pseudonymisierung

Jeder Benutzer kann festlegen, ob der eigene Name und die eigene E-Mail-Adresse in gewissen Kontexten sichtbar sein sollen.
Benutzer, die dies ablehnen, erscheinen unter einem Pseudonym.
Administratoren, die den Benutzer verwalten können, sehen im Kontext der Benutzerverwaltung immer die tatsächlichen Daten.

<figure>
  <img src="/screenshots/keycloak-set-pseudonymization.webp" />
  <figcaption>Beim der ersten Anmeldung muss eine Auswahl getroffen werden</figcaption>
</figure>

<figure>
  <img src="/screenshots/keycloak-change-pseudonymization.webp" />
  <figcaption>Die Einstellung kann jederzeit geändert werden.</figcaption>
</figure>

Änderungen werden ab dem nächsten Login in der jeweiligen Anwendung wirksam.

## Benutzer anlegen

Benutzer können in der Benutzerverwaltung angelegt werden.
Diese ist für Gruppenadministratoren über das Einstellungsmenü des Gov Hub erreichbar.

<figure>
  <img src="/screenshots/govhub-useradmin.webp" />
  <figcaption>Link zur Benutzerverwaltung</figcaption>
</figure>

Anschließend müssen Vorname, Name und E-Mail-Adresse ausgefüllt sowie mindestens eine Benutzergruppe oder Tenantgruppe zugewiesen werden.

<figure>
  <img src="/screenshots/keycloak-user-create.webp" />
  <figcaption>Benutzerformular</figcaption>
</figure>

Nach dem **Erstellen** kann unter **Passwörter**, **Zugang zurücksetzen** die initiale E-Mail an den Benutzer ausgelöst werden. Hierbei sollten **Update Password** und **Verify Email** ausgewählt werden.
