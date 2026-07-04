# ADR-001: Monorepo Architecture

## Status

Accepted

## Context

InkFlow contains a React frontend and a Node.js backend that must evolve
together during the early product sprints. The project also needs shared
repository-level tooling for TypeScript, linting, formatting, Docker Compose,
and future CI/CD.

## Decision

Use a single repository with npm workspaces.

The repository contains:

- `apps/backend`
- `apps/frontend`
- root package configuration
- shared TypeScript, ESLint, and Prettier configuration
- root Docker Compose configuration

## Consequences

- Frontend and backend changes can be reviewed together.
- Shared quality gates can run from the repository root.
- Workspace boundaries remain explicit through app-level package files.
- Future packages can be added only when there is a concrete need.
