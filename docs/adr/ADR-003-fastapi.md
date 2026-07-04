# ADR-003: Use FastAPI for the Backend

## Status

Proposed

## Context

The backend needs to expose APIs, orchestrate ingestion, validate payloads, normalize events, resolve relationships, and support future AI-assisted workflows.

The preferred stack includes Python and FastAPI.

## Decision

Use FastAPI as the backend framework for the MVP.

## Alternatives

### Django

Pros:

- Mature batteries-included ecosystem.
- Strong admin and ORM story.

Cons:

- Heavier application structure.
- Less natural fit for API-first event workflows unless carefully constrained.

### Node.js Backend

Pros:

- Shared language with the frontend.
- Strong ecosystem for web APIs.

Cons:

- Python is better aligned with future AI, data processing, and infrastructure analysis workflows.

### Go Backend

Pros:

- Strong performance and operational profile.
- Good fit for infrastructure systems.

Cons:

- Slower iteration for the current team if Python is the preferred backend stack.
- Future AI and data workflow ecosystem is less direct.

## Tradeoffs

FastAPI offers speed, strong typing through Pydantic, and a clean API development model. The team must still enforce domain boundaries and avoid letting route handlers become business logic.

## Consequences

- Use Pydantic schemas at API boundaries.
- Keep domain services separate from HTTP routing.
- Use background worker patterns carefully.
- Instrument the app with OpenTelemetry-compatible hooks when implementation begins.

