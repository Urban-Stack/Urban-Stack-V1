# GraphQL

Zur Verwaltung der Plattformressourcen steht eine [GraphQL](https://graphql.org/)-Schnittstelle unter  
`https://login.DOCS_BASE_DOMAIN/realms/udh/data-hub/graphql`  
zur Verfügung.  
Zur Entwicklung der Abfragen ist [GraphiQL](https://github.com/graphql/graphiql) unter [https://login.DOCS_BASE_DOMAIN/realms/udh/data-hub/graphiql](https://login.DOCS_BASE_DOMAIN/realms/udh/data-hub/graphiql) verfügbar.

<figure>
  <img src="/screenshots/graphiql.webp" />
  <figcaption>GraphiQL</figcaption>
</figure>

Die verfügbaren Abfragen und Mutationen können in GraphiQL eingesehen werden.

## Authentifizierung

Zur Authentifizierung können [Bearer Tokens](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication#bearer) eingesetzt werden wenn die Abfrage dies erfordert.

Dies geschieht im von der Plattform bereitgestellen [GraphiQL-Editor](https://login.DOCS_BASE_DOMAIN/realms/udh/data-hub/graphiql) automatisch. Die Queries und Mutations werden mit den Berechtigungen des eingeloggten Benutzers ausgeführt. Sollte es einmal einen Fehler bei der Authentifizierung geben (`unauthorized`), kann dieser meistens durch ein Neuladen der Seite behoben werden.

## Hilfsbibliothek

Über die in JupyterLab integrierte [Hilfsbibliothek](hilfsbibliothek.md) kann ein authentifizierter GraphQL-Client erstellt werden:

```python title="Login"
from _ import login, GraphQLRequest
auth = login()
```

```python title="Mandantennamen abfragen"
auth.graphql.execute(GraphQLRequest("{ tenants { tenant } }"))
```

```json title="Ergebnis"
{
	"tenants": [
		{ "tenant": "anderermandant" },
		{ "tenant": "meinmandant" },
		{ "tenant": "weiterer" },
		{ "tenant": "nocheinmandant" }
	]
}
```

```python title="Abfrage mit Variablen"
auth.graphql.execute(GraphQLRequest("query ($tenant:String!) { tenant(tenant:$tenant) { projects { project } } }", variable_values={"tenant": "knuffingen"}))
```

```json title="Ergebnis"
{
	"tenant": {
		"projects": [
			{
				"project": "trainstation"
			}
		]
	}
}
```
