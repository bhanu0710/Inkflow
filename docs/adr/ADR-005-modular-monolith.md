# ADR-005: Modular Monolith

## Status

Accepted

## Context

InkFlow is expected to become a production SaaS platform, but the current stage
does not justify distributed service boundaries. The project needs clean module
boundaries without introducing operational complexity before the product domains
exist.

## Decision

Build InkFlow as a modular monolith.

Backend code follows this dependency direction:

```text
controllers -> services -> repositories -> database
```

Controllers validate requests, call services, and return responses. Services
own business logic. Repositories own Prisma access.

## Consequences

- The system remains simple to deploy and test during early sprints.
- Clean Architecture boundaries are explicit from the start.
- Future extraction into separate services remains possible if operational or
  product scale requires it.
