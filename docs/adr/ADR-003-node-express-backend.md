# ADR-003: Node.js and Express Backend

## Status

Accepted

## Context

InkFlow requires a TypeScript backend foundation with explicit request handling,
validation, logging, API documentation, and future Kubernetes readiness.

## Decision

Use Node.js, Express, and TypeScript for the backend application.

The backend lives in `apps/backend` and includes:

- environment validation
- Pino logging
- request correlation
- Swagger UI initialization
- health probe skeletons
- graceful shutdown handling

## Consequences

- The backend stack matches the approved InkFlow technology choices.
- Express controllers can remain thin HTTP adapters.
- Business logic will be added in services during future approved sprints.
- The backend can run locally through npm or Docker Compose.
