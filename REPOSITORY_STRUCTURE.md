# Repository Structure

## Goal

The repository should feel like a real startup monorepo: clear ownership, explicit contracts, and room to grow without pretending the MVP is already a distributed platform.

This document defines the intended structure. Implementation directories should be created when implementation is approved.

## Proposed Monorepo Layout

```text
infragence/
  README.md
  VISION.md
  MISSION.md
  PRODUCT_PRD.md
  ENGINEERING_DESIGN_DOCUMENT.md
  SYSTEM_ARCHITECTURE.md
  DOMAIN_MODEL.md
  EVENT_MODEL.md
  DATABASE_DESIGN.md
  API_SPECIFICATION.md
  REPOSITORY_STRUCTURE.md
  CODING_STANDARDS.md
  CONTRIBUTING.md
  ROADMAP.md
  SECURITY.md
  OBSERVABILITY.md
  DEPLOYMENT_ARCHITECTURE.md
  docs/
    adr/
    rfc/
    runbooks/
    diagrams/
  apps/
    web/
    api/
    worker/
  packages/
    shared-contracts/
    test-fixtures/
  infra/
    docker/
    terraform/
    kubernetes/
  scripts/
  .github/
    workflows/
```

## Directory Responsibilities

### docs

Long-lived architecture, design, decision, and operational documents.

### docs/adr

Architecture Decision Records. Any major technical choice must be captured here.

### docs/rfc

Request for Comments documents. Major product capabilities should start here before implementation.

### apps/web

Future Next.js frontend application.

### apps/api

Future FastAPI backend application.

### apps/worker

Future background worker entrypoint. This should use the same backend domain modules, not a separate product architecture.

### packages/shared-contracts

Future shared API schemas, event taxonomies, and generated client contracts.

### packages/test-fixtures

Future test fixtures for infrastructure events, timelines, and source payloads.

### infra

Deployment and cloud infrastructure assets.

### scripts

Developer and CI automation scripts.

## Repository Rules

- Documentation comes before implementation for major systems.
- ADRs capture irreversible or expensive technical decisions.
- RFCs capture major feature proposals.
- Implementation should not mix source-specific parsing logic with domain reasoning logic.
- No secrets, kubeconfigs, cloud credentials, private tokens, or production payloads should be committed.

## Monorepo Tooling Direction

Recommended future tooling:

- pnpm for frontend package management
- Python virtual environment or uv for backend dependency management
- Ruff and mypy for Python quality
- ESLint, TypeScript, and Prettier for frontend quality
- GitHub Actions for CI
- Docker Compose for local dependencies

Tooling should be chosen for developer speed and clarity, not novelty.

