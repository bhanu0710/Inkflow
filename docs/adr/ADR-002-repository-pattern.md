# ADR-002: Repository Pattern

## Status

Accepted

## Decision

InkFlow uses the Repository Pattern for database access.

Repositories are the only backend layer allowed to import or use Prisma.

## Rules

- Controllers must not access repositories directly.
- Services call repositories.
- Repositories do not enforce business policy.
- Repositories do not decide authorization.

## Consequences

Prisma usage remains isolated. Future persistence changes or query
optimizations can be made without leaking database logic into controllers or
services.
