# Object Storage

(S3-kompatibler) Object Storage wird mit Ceph bereitgestellt.

Um die Komplexität zustandsbehafteter Benutzerverwaltung auf Ceph-Seite, das Synchronisieren von Berechtigungen und die Sicherheitsrisiken durch Abhandenkommen von Zugangsdaten zu minimieren, bekommen Benutzer lediglich temporäre Zugangsdaten über Keycloak und den [sts:AssumeRoleWithWebIdentity](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html)-Mechanismus.

Relevante Upstream-Dokumentation hierzu

- [Integrating Keycloak with RadosGW](https://docs.ceph.com/en/reef/radosgw/keycloak/)
- [STS in Ceph](https://docs.ceph.com/en/reef/radosgw/STS/)
- [Session tags for Attribute Based Access Control in STS](https://docs.ceph.com/en/reef/radosgw/session-tags/)

## Debugging

Um Probleme mit Berechtigungen zu debuggen kann mit folgendem Snippet das Debug-Logging aktiviert werden.

```sh title="Debug-Logging aktivieren"
alias c='kubectl exec -it deploy/rook-ceph-tools -- ceph'
c config set global debug_rgw 20/5
```

Eventuelle Probleme können meist in der Ausgabe von `deploy/rook-ceph-rgw-bucket-a` gefunden werden.

```sh title="Debug-Logging deaktivieren"
c config rm global debug_rgw
```

```sh title="awscli kann ebenfalls hilfreich sein"
alias aws='aws --endpoint-url https://storage.XXXXXXXXXXXXXXX.urbanstack.de'
export AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXXXX
export AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

aws s3api get-bucket-policy help
aws s3api get-bucket-policy --bucket XXXXXXX
```

## Benutzung

Siehe [Storage Buckets](../schnittstellen/buckets.md).
