# Engineering Principles

InkFlow implementation must follow these principles.

## Security by Design

Security must be part of the default implementation path, not a cleanup task.

## Clean Architecture

Dependencies flow inward from HTTP adapters toward services and repositories.

## Repository Pattern

Prisma access is restricted to repositories.

## Service Layer Pattern

Business logic and transaction orchestration belong in services.

## Explicit Over Implicit

Domain rules should be visible in code and tests.

## Simplicity Over Cleverness

Do not introduce abstractions without a concrete need.

## Convention Over Customization

Prefer consistent project patterns over one-off designs.

## Production Readiness

Code must be written with deployment, rollback, observability, and failure modes
in mind.

## Observability

Logs, request IDs, health checks, and future metrics must support production
debugging.

## Free-Tier Friendly

Design choices should avoid unnecessary managed services and excessive resource
usage.
