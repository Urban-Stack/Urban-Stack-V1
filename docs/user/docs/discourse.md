# Discourse

Discourse ist die zentrale Chat- und Diskussionskomponente für die Community des Urbanstacks. Die Anwendung kann eingebettet über den Gov Hub aufgerufen werden:

<figure>
  <img src="/screenshots/govhub-discourse.webp" />
  <figcaption>Discourse Menüpunkt</figcaption>
</figure>

Discourse ist in das Berechtigungskonzept der Plattform integriert. Für Mitglieder eines Mandanten bedeutet dies, dass sie in der mandantenspezifischen Kategorie Themen erstellen und kommentieren können. Mitglieder mit Admin-Berechtigungen für einen Mandanten können außerdem in dessen Kategorie moderieren und z.B. Beiträge löschen.

## Struktur

Discourse ist in drei Hierarchie-Ebenen unterteilt:

### Kategorien

Kategorien sind die oberste Ebene in Discourse, alle Themen sind genau einer Kategorie zugeordnet. Kategorien können nur von globalen Discourse-Administratoren erstellt und gelöscht werden.

<figure>
  <img src="/screenshots/discourse-main.webp" />
  <figcaption>Discourse Hauptseite mit Kategorien</figcaption>
</figure>

Folgende Kategorien sind in Discourse verfügbar:

#### Mandantenspezifische Kategorie

Jeder Mandant hat eine Kategorie, die auch nur von Mitgliedern dieses Mandanten eingesehen werden kann. Daher befindet sich auch ein Schloss neben dem Namen des Mandanten.

#### Allgemein

In dieser Kategorie werden Themen erstellt, die nicht einer anderen Kategorie zugeordnet werden können. Alle angemeldeten Benutzer können in dieser Kategorie alle Themen und Beiträge lesen sowie neue erstellen.

#### Feedback

Diese Kategorie dient dazu, um über das Community-Forum selber zu diskutieren, sie ist ebenfalls für alle angemeldeten Benutzer freigegeben.

#### Für Admin-Benutzer: Team

Diese Kategorie kann nur von Mitgliedern mit Admin-Berechtigungen für mindestens einen Mandanten genutzt werden. Dort können Themen, die für die Moderation des Community-Forums relevant sind, diskutiert werden.

### Themen

Ein Thema besteht aus einem Titel und mehreren Beiträgen. Sowohl Themen als auch Beiträge können von allen Nutzenden in Kategorien erstellt werden, die sie sehen können.

<figure>
  <img src="/screenshots/discourse-topic-list.webp" />
  <figcaption>Liste von Themen in einer Kategorie</figcaption>
</figure>

### Beiträge

Beiträge sind die einzelnen Antworten in einem Thema, in denen diskutiert werden kann.

<figure>
  <img src="/screenshots/discourse-topic.webp" />
  <figcaption>Ansicht eines Beitrags in einem Thema</figcaption>
</figure>

## Themen durchsuchen

Um im Community-Forum zu suchen, kann die Suchfunktion durch das Drücken des Lupen-Icons oben rechts verwendet werden.

Hier kann die Suchanfrage eingegeben werden, auch werden direkt passende Schlagwörter angezeigt.

<figure>
  <img src="/screenshots/discourse-search-entered.webp" />
  <figcaption>Suche nach "fahrrad"</figcaption>
</figure>

Durch das einmalige Drücken der Eingabetaste (Enter) wird die Suche ausgeführt und die Ergebnisse direkt im Dropdown angezeigt. Drückt man ein weiteres Mal die Eingabetaste, öffnet sich die Detailsuche, bei der die Suchanfrage verfeinert werden kann.

<figure>
  <img src="/screenshots/discourse-search-result.webp" />
  <figcaption>Suchergebnisse</figcaption>
</figure>

## Mit Themen interagieren

Die Buttons, um mit einem Thema zu interagieren, finden sich ganz unten auf der Seite, nach allen Beiträgen.

<figure>
  <img src="/screenshots/discourse-topic.webp" />
  <figcaption>Ansicht eines Themas mit Buttons zur Interaktion</figcaption>
</figure>

Es ist sowohl möglich, auf einen Beitrag in einem Thema zu antworten als auch mit dem "Antworten"-Button am Ende eines Themas auf das ganze Thema zu antworten.

<figure>
  <img src="/screenshots/discourse-topic-reply-post.webp" />
  <figcaption>Auf einen Beitrag antworten</figcaption>
</figure>

Für ein Thema kann ein Lesezeichen gesetzt werden, um dieses später einfacher wiederfinden zu können.

<div style="display: flex; gap: 1em; align-items: flex-end;">
<figure>
  <img src="/screenshots/discourse-topic-set-bookmark.webp" />
  <figcaption>Lesezeichen für Thema setzen</figcaption>
</figure>
<figure>

  <img src="/screenshots/discourse-user-settings-bookmark.webp" />
  <figcaption>Lesezeichen im Profilmenü ansehen</figcaption>
</figure>
</div>

Ein Thema kann über einen Link geteilt werden. Dabei ist zu beachten, dass Themen nur innerhalb eines Mandanten sichtbar sind, also von Mitgliedern anderer Mandanten nicht angezeigt werden können.

Soll ein Beitrag auch für Mitglieder anderer Mandanten zugänglich sein, muss dieser in einer öffentlichen Kategorie (wie z.B. [Allgemein](#allgemein)) erstellt werden.

<figure>
  <img src="/screenshots/discourse-topic-share-post.webp" />
  <figcaption>Beitrag teilen</figcaption>
</figure>

Sollte ein Beitrag gegen die Community-Richtlinien verstoßen, kann dieser dem Moderations-Team über den "Melden"-Button gemeldet werden.

<figure>
  <img src="/screenshots/discourse-topic-report-post-confirm.webp" />
  <figcaption>Beitrag melden</figcaption>
</figure>

Die Benachrichtigungen für ein Thema können individuell über den Button mit dem Glockensymbol konfiguriert werden, wobei immer die aktuelle Einstellung angezeigt wird:

- Beobachten: Jeder neue Beitrag im Thema löst eine Benachrichtigung aus. Dies ist der Standard, wenn man ein Thema gestartet hat.
- Verfolgen: Man wird nur benachrichtigt, wenn man direkt erwähnt wird, oder eine andere Person auf einen eigenen Beitrag antwortet. Außerdem wird in der Übersicht neben diesem Thema angezeigt, wie viele neue Antworten seit dem letzten Besuch verfasst wurden. Diese Benachrichtigungsstufe wird automatisch eingestellt, sobald man ein Thema liest.
- Normal: Ähnlich wie "Verfolgen", allerdings wird die Anzahl der neuen Antworten nicht angezeigt.
- Stummgeschaltet: Es werden keine Benachrichtigungen ausgelöst, auch nicht, wenn man selber erwähnt wird.

<figure>
  <img src="/screenshots/discourse-topic-notification.webp" />
  <figcaption>Benachrichtigungseinstellungen</figcaption>
</figure>

## Thema erstellen

Durch den Button "Neues Thema" kann ein neues Thema erstellt werden.

<figure>
  <img src="/screenshots/discourse-create-topic-button.webp" />
</figure>

Befindet man sich bereits im Kontext einer Kategorie, wird das neue Thema in dieser Kategorie erstellt. Wird das Thema von der Hauptseite aus erstellt, muss über das Kategorie-Auswahl-Dropdown eine Kategorie ausgewählt werden.

<figure>
  <img src="/screenshots/discourse-create-topic-change-category.webp" />
  <figcaption>Dropdown um die Kategorie auszuwählen, in der das Thema erstellt werden soll</figcaption>
</figure>

Außerdem können Schlagwörter für Themen vergeben werden, um diese zu ordnen und später (z.B. über die [Suche](#themen-durchsuchen)) wiederfinden zu können.

<figure>
  <img src="/screenshots/discourse-create-topic-tags.webp" />
  <figcaption>Dropdown um Schlagwörter auszuwählen</figcaption>
</figure>

### Thema Editor

Im Folgenden werden beispielhaft unterschiedliche Formatierungsoptionen aufgezeigt. Diese können auf einen Text angewendet werden indem zuerst der Text markiert wird, und dann die entsprechende Option aus den Optionen über dem Textfeld ausgewählt wird. Rechts daneben wird das Thema so angezeigt, wie es aussieht, sobald das Thema erstellt wurde. Exemplarisch ist hier die Option "Kursiv" hervorgehoben.

<figure>
  <img src="/screenshots/discourse-topic-creator.webp" />
  <figcaption>Ein Thema mit Formatierungen</figcaption>
</figure>

An einen Beitrag können Dateien angehängt werden, allerdings nur Bilddateien (mit den Dateiendungen `jpg`,`jpeg`,`png`,`gif`,`heic`,`heif`,`webp`,`avif`) und IPython-Notebooks (mit der Dateiendung `ipynb`), welche in [JupyterHub](./jupyterhub.md) verwendet werden können.

### Umfragen

Auch ist es möglich, Umfragen direkt in einem Thema zu erstellen.

<figure>
  <img src="/screenshots/discourse-create-topic-create-poll.webp" />
  <figcaption>Eine Umfrage erstellen</figcaption>
</figure>

Zu guter Letzt muss man das Thema mit einem Klick auf "Thema erstellen" final erstellen.

<figure>
  <img src="/screenshots/discourse-create-topic-submit.webp" />
  <figcaption>Thema erstellen</figcaption>
</figure>

## Beitrag bearbeiten

Um einen Beitrag zu editieren, muss man auf das Stift-Icon klicken.

<figure>
  <img src="/screenshots/discourse-edit-topic.webp" />
  <figcaption>Thema bearbeiten</figcaption>
</figure>

Allerdings ist nur das Bearbeiten eigener Beiträge möglich, nur Moderatoren eines Mandanten können auch alle anderen Beiträge in der Kategorie ihres Mandanten bearbeiten.

Nachdem der Beitrag mit dem [Editor](#thema-editor) bearbeitet wurde, kann dieser durch einen Klick auf "Bearbeitung speichern" gespeichert werden.

## Chat

Um Direktnachrichten an andere Teilnehmende des Forums zu senden, kann der Menüpunkt "Chat" im Gov Hub genutzt werden. Dadurch wird der Chat im Vollbildmodus angezeigt.

<figure>
  <img src="/screenshots/govhub-chat.webp" />
  <figcaption>Link zum Discourse-Chat</figcaption>
</figure>

Dort finden sich alle aktuellen Direktnachrichten, über das Plus-Symbol neben "Chat" kann eine neue Konversation erstellt werden.

<figure>
  <img src="/screenshots/discourse-create-chat.webp" />
  <figcaption>Einen neuen Chat erstellen</figcaption>
</figure>

<figure>
  <img src="/screenshots/discourse-chat-search-user.webp" />
  <figcaption>Gesprächspartner für Chat auswählen</figcaption>
</figure>

## Moderation

Für Moderatoren eines Mandanten sind zusätzliche Aktionen verfügbar. Eine Person ist automatisch Moderatorin der mandantenspezifischen Kategorie, wenn sie in der Admin-Benutzergruppe des Mandanten ist.

Moderatoren können alle Beiträge und Themen [bearbeiten](#beitrag-bearbeiten), auch wenn sie diese nicht selber verfasst haben.

### Offizielle Mitteilungen

Moderatoren können "offizielle Mitteilungen" zu einem Beitrag erstellen und bearbeiten. Diese werden allen Benutzern über dem ursprünglichen Beitrag angezeigt.

<figure>
  <img src="/screenshots/discourse-official-notice.webp" />
  <figcaption>Eine offizielle Mitteilung</figcaption>
</figure>

Um eine offizielle Mitteilung hinzuzufügen muss zuerst auf die 3 Punkte unter dem entsprechenden Beitrag geklickt werden, dann auf das Schraubenschlüsselsymbol und dann auf "Offizielle Mitteilung hinzufügen".

<figure>
  <img src="/screenshots/discourse-add-official-notice.webp" />
  <figcaption>Eine offizielle Mitteilung hinzufügen</figcaption>
</figure>

### Thema Moderieren

<figure>
  <img src="/screenshots/discourse-moderate-topic-menu.webp" />
  <figcaption>Menü für Moderationsoptionen an einem Thema</figcaption>
</figure>

- Beiträge auswählen. Nachdem auswählen einer oder mehrerer Beiträgen können diese Beiträge entweder gelöscht oder in ein neues bzw. bereits existierendes Thema verschoben werden. Falls alle Beiträge vom selben Benutzer stammen, können die Beiträge auch zu einem zusammengefasst werden.
- Thema löschen. Löscht ein Thema unwiderruflich.
- Thema schließen/öffnen. Ein geschlossenes Thema hindert Benutzer ohne Moderationsberechtigungen daran, in diesem neue Beiträge zu verfassen. Das Thema wird weiterhin normal angezeigt.
- Thema anheften. Ein angeheftetes Thema wird immer am Anfang der Liste von Themen in einer Kategorie angezeigt. Es kann ausgewählt werden, wie lange ein Thema angeheftet bleiben soll.
- Thema archivieren. Ein archiviertes Thema hindert Benutzer ohne Moderationsberechtigungen daran, mit diesem Thema zu interagieren. Das Thema ist außerdem versteckt, es sei denn man ruft explizit die Themenliste der Kategorie auf.
- Thema nicht auflisten. Das Thema wird nicht mehr in der Suche und in der Themenliste angezeigt und kann nur noch über einen direkten Link aufgerufen werden. Dies gilt auch für Moderatoren.

Weitere Infos zu geschlossenen, versteckten und archivierten Themen finden sich in der [offiziellen Discourse-Dokumentation](https://meta.discourse.org/t/understanding-closed-unlisted-and-archived-topics/51238)

### Meldungen bearbeiten

Wenn ein Benutzer einen Beitrag meldet, muss die Meldung von den Moderatoren des Mandanten bearbeitet werden. Meldungen in nicht-mandantenspezifischen Kategorien wie z.B. Allgemein können nur von globalen Discourse-Administratoren bearbeitet werden.

<figure>
  <img src="/screenshots/discourse-link-to-review.webp" />
  <figcaption>Link zu den gemeldeten Beiträgen</figcaption>
</figure>

<figure>
  <img src="/screenshots/discourse-review-report.webp" />
  <figcaption>Ansicht eines gemeldeten Beitrages</figcaption>
</figure>

Hier kann ausgewählt werden, wie mit dem gemeldeten Beitrag verfahren werden soll:

Wenn der gemeldete Beitrag nicht zu beanstanden ist, kann die Meldung mit einem Klick auf "Nein" gelöscht werden.

Außerdem kann die Meldung ignoriert werden. Hier besteht die Möglichkeit, entweder nichts zu unternehmen oder den Beitrag zu löschen.

Wenn die Meldung berechtigt ist, gibt es ebenfalls mehrere Optionen:

- Der Beitrag kann ausgeblendet werden. Damit wird der Beitrag vor allen anderen Benutzern versteckt und der Besitzer des Beitrags wird gebeten, diesen nachzubessern. Nach der Bearbeitung ist der Beitrag wieder sichtbar.
- Der Beitrag kann trotzdem behalten werden.
- Der Beitrag kann vom Moderator direkt bearbeitet werden.
- Der Beitrag kann gelöscht werden. Ist dies der erste Beitrag eines Themas wird das komplette Thema gelöscht.
