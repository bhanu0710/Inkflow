# ADR-001: Clean Architecture

## Status

Accepted

## Decision

InkFlow uses Clean Architecture for backend implementation.

The dependency flow is:

```text
Router -> Middleware -> Validation -> Controller -> Service -> Repository -> Prisma
```

## Rules

- Controllers contain no business logic.
- Services contain business logic.
- Services own transactions.
- Repositories are the only layer allowed to access Prisma.
- Repositories contain persistence logic only.

## Consequences

Implementation will require more explicit files and boundaries, but the codebase
will be easier to test, review, and maintain.
