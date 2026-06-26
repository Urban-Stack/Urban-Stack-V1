# 4. Additional Information for Resources

Date: 2024-07-12

## Status

accepted

## Context

The managed resources managed through Keycloak are the foundation for automatic configuration of the various abstractions of integrated components such as Grafana organizations, Mimir tenants etc.

Currently there is no mechanism to add additional information for resources such as groups.
A group named `dep-demo-names` might be created for the "Department of Demo Names and Examples in Documentation", yet there is no way to add the latter and display it in places where it is feasible and useful.

The attributes requested so far are either potentially useful for all resources (display name) or only make sense for some (publishing date).

Most and the most urgent use cases such as display names can be saved as a reasonably short string and does not consist of nested data structures such as lists.

## Decision

We will add a uniform mechanism to attach arbitrary string values under string keys to all resources.

The implementation will be targeted mainly at values under 200 characters and mainly fewer than 20 entries per resource.

## Consequences

It becomes easier to attach meta data to resources and through conventions provide uniform mechanisms for display names across the platform.

There is a risk of overuse and building more complex abstractions on this concept, therefore it is imperative to re-evaluate and amend or supersede this ADR if and when patterns and shortcomings become apparent.
