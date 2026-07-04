# ADR-003: PostgreSQL and Prisma

## Status

Accepted

## Decision

InkFlow uses PostgreSQL as the database and Prisma as the ORM.

## Rules

- Prisma schema changes are reviewed through migrations.
- Application models are introduced only when approved by implementation scope.
- Repositories are the only Prisma access layer.

## Consequences

The system gets relational integrity, typed data access, and a clear migration
workflow.
