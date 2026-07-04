# ADR-001: Use a Modular Monolith for the MVP

## Status

Proposed

## Context

Infragence needs to ingest events, normalize facts, resolve relationships, build timelines, and support investigations. These domains may eventually become separate services, but the MVP must validate product value before adding distributed systems complexity.

The product also has a small initial scope:

- One Kubernetes cluster
- One GitHub repository
- One Prometheus instance

## Decision

Build the MVP as a modular monolith.

The backend should be one deployable application with explicit internal domain boundaries:

- sources
- ingestion
- events
- entities
- relationships
- timelines
- investigations
- memory
- audit

## Alternatives

### Microservices

Pros:

- Independent scaling boundaries
- Clear operational ownership at large team size
- Natural isolation for ingestion-heavy workloads

Cons:

- Requires service discovery, distributed tracing, network security, deployment choreography, and more CI/CD complexity.
- Makes early product iteration slower.
- Creates failure modes before product-market signal exists.

### Serverless-first Architecture

Pros:

- Low idle cost
- Managed scaling
- Strong fit for event ingestion tasks

Cons:

- Harder local development.
- Harder cross-source transaction and relationship workflows.
- Can fragment domain logic too early.

## Tradeoffs

The modular monolith may require refactoring when ingestion volume grows. That is acceptable because early clarity, speed, and correctness matter more than premature scalability.

## Consequences

- Use module boundaries and tests to prevent a tangled monolith.
- Keep source connectors separate from domain reasoning.
- Design interfaces so ingestion, timeline, or relationship modules can be extracted later.

