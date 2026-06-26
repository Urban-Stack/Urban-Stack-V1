# 2. Anonymous Access Implementation

Date: 2024-07-12

## Status

accepted

## Context

For certain aspects of the platform anonymous access must be granted.

While the existing authorization structure supports various scenarios, fully anonymous access is not currently implemented as such.

Adding anonymous access as an alternative to the existing permission policies (currently only groups are implemented) would keep the authorization configuration uniform but does not make sense for all parts of the platform which forces us to prevent, handle or ignore it in such cases.
Some components such as Grafana with header-based authentication cannot easily be made to additionally accept unauthenticated requests in the same instance.
In the case of the current Grafana implementation we also need a different approach to begin with as [without the public dashboards feature anyone can perform any query on the configured datasources, not just the configured queries](https://github.com/grafana/grafana/issues/26567#issuecomment-663354731).

One approach that is already used in the WIP Grafana Public Dashboard implementation is to create a custom mechanism for that area of the platform (here: if a `public` tag is set then the dashboard is published).

## Decision

We will implement anonymous access through per-component mechanisms that take into account the specifics of the component.

We will build upon existing mechanisms of the components (such as publishing dashboards in Superset) where it makes sense.

We will not implement anonymous access for everything, for example administration access to a whole tenant.

## Consequences

For the limited number of places where anonymous access (as opposed to permissions for many or even all authenticated users) is necessary, specialized mechanisms can be developed.

There is no way to express anonymous access in the authorization structure for aspects where it does not make sense or will not be implemented.

For components that support a publishing workflow that can be, re-used this leads to a more intuitive user and possibly integration experience.
