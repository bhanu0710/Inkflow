# ADR-004: PostgreSQL and Prisma

## Status

Accepted

## Context

InkFlow needs a durable relational database foundation for future blogging
domain data. The application also requires a typed database access layer and a
clear boundary that prevents Prisma usage from spreading across controllers or
services.

## Decision

Use PostgreSQL as the database and Prisma as the ORM.

Repositories are the only backend layer allowed to access Prisma. Sprint 0
initializes Prisma with a PostgreSQL datasource but does not create application
models.

## Consequences

- Future schema changes will be managed through Prisma.
- Services will depend on repositories instead of direct database access.
- The current database foundation remains minimal until product models are
  approved.
