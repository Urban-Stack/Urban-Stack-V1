# 1. Architecture Decision Records

Date: 2024-07-12

## Status

accepted

## Context

With any non-trivial software project that involves multiple developers
or is developed over a longer time span
a need arises to communicate and document architectural decisions.

Writing short documents with differing structure and file name conventions
makes it harder to find the information one seeks.

## Decision

We will use [Architecture Decision Records][blog].

We will use [adrgen](https://github.com/asiermarques/adrgen) or tools that create compatible changes.

We will create ADRs that can be agreed upon quickly as `accepted` using a merge request workflow.

For broader decisions that need to be discussed and evaluated over a longer timespan we will create `proposed` ADRs.

## Consequences

See [Architecture Decision Records][blog].

The uniform structure makes it easy to determine the motivation behind certain changes
and to choose a way forward that is in line with previous considerations.

[blog]: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
