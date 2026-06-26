# 3. Extraction of viz-group

Date: 2024-07-12

## Status

accepted

## Context

The data within the platform is organized in projects.

There are two main expectations regarding dashboards and data visibility:

1. Dashboards are expected to allow use of data from multiple projects.
2. Users with different individual permissions (to view data) are expected to see the same results when viewing the same dashboard in the same context.

Currently this is solved by creating a Grafana organization per group, while the projects visible from within that organization are determined based on permissions that grant read access to that group (and its members).

While this does fulfill the two main expectations, it creates negative side effects and an unintuitive user experience:

- (especially for tenant admins) the organization dropdown menu in Grafana is clogged with irrelevant entries as not all groups are used to bundle dashboards
- the configuration can become confusing, especially in cases where a group without members is created just to manage dashboard and (users from) other groups are then given access to use it as such

These are fundamental problems that will extend to other components such as Apache Superset as well.

The underlying problem is that the group resource type is used for two related but different use cases: Bundling users and creating a space in which to manage dashboards.

## Decision

We will split off the dashboard management part of the `group` resource type into a new type `viz-group` (visualisation group).

`viz-group` as a new resource type under `tenant`.

`viz-group`s will encompass the visualisation groupings managed in the context of that tenant across all components such as Apache Superset.

Instead of relying on the data visibility determined by permissions referencing a group, a `viz-group` is a technical entity that can be granted access through a permission, similar to how it works with (user) `group`s. In the terminology of Keycloak Authorization Services this will be a new kind of "Policy".

## Consequences

Configuration becomes more intuitive as the two functions of user bundling and visualisation bundling are now handled separately through `group`s and `viz-group`s.

The mentioned negative side effects are mitigated.

The authorization model becomes slightly more complex due to an additional indirection layer.
