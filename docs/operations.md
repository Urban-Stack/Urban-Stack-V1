# Operations

## Add Tenant

Using an admin user `PUT /tenants/XXX`, for example from JupyterHub using platform administrator credentials, see [Resources and Authorization](./resources_authorization.md]).

## Recover ClickHouse

At the moment, all ClickHouse data can be fully re-created from Kafka topics and the resource information in Keycloak.

To do this,

1. delete the `chi` and `chk` and wait for all pods+volumes to be deleted
2. delete the ClickHouse consumer groups from the Kafka cluster using a tool such as [kafkactl](https://github.com/deviceinsight/kafkactl)
3. re-run the Helm rollout, the upgrade will recreate the ClickHouse infrastructure and the repair job in the migrations post upgrade hook will configure it (users, named collections, tables)

## Fixing Superset thumbnails after an outage

Thumbnails are cached for a week unless changes are made to the dashboard/chart to minimize the delay until they show up.
If a misconfiguration or outage caused many thumbnails to be wrong they all can be reset at once.

To do this, simply delete/restart Superset Redis.
This does have the side effect of logging out all users from Superset, but that should - in most contexts - trigger a new login automatically.

## Recover CKAN Solr

When CKAN solr somehow ends up in a bad state so it only throws HTTP 500 and the following error can be found in the logs:

```
java.lang.UnsupportedOperationException: null
        at org.apache.lucene.queries.function.FunctionValues.longVal(FunctionValues.java:58) ~[?:?]
        at org.apache.solr.update.VersionInfo.getVersionFromIndex(VersionInfo.java:163) ~[?:?]
        at org.apache.solr.update.UpdateLog.lookupVersion(UpdateLog.java:1313) ~[?:?]
...
```

Solution: delete and redeploy solr

- scale solr down to 0 replicas, delete PVCs
- scale solr zookeeper to 0 replicas, delete PVCs
- scale solr zookeeper back up to 3 replicas
- scale solr back up to 2 replicas

(This could be potentially automated if it happens again)

- check the `ckan` database in postgres to get all datasets: `select * from package;`
- for every dataset:
  - go to `https://ckan.{baseUrl}/dataset/{dataset}`
  - for every resource:
    - click
    - click `Ressource bearbeiten`
    - click `DataStore`
    - click `Zum DataStore hochladen`
