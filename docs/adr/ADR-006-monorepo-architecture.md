# ADR-006: Monorepo Architecture

## Status

Accepted

## Decision

InkFlow uses a monorepo with npm workspaces.

## Structure

```text
apps/
  backend/
  frontend/
```

## Consequences

Frontend and backend changes can be reviewed together. Shared tooling can run
from the repository root.
