# ADR-002: React and Vite Frontend

## Status

Accepted

## Context

InkFlow needs a TypeScript frontend foundation that is maintainable, fast to
develop locally, and compatible with containerized production delivery.

## Decision

Use React, TypeScript, and Vite for the frontend application.

The frontend lives in `apps/frontend` and currently contains only the project
skeleton. No pages or product UI were introduced during Sprint 0.

## Consequences

- The frontend has a fast local development server.
- Production builds emit static assets that can be served by a minimal web
  server image.
- Future UI work can be added without changing the repository structure.
