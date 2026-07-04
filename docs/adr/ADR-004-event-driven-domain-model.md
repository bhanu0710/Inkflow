# ADR-004: Use an Event-Driven Domain Model

## Status

Proposed

## Context

Infragence exists to answer operational questions about what happened. Infrastructure behavior is naturally event-based:

- Deployments start and finish.
- Pull requests merge.
- Pods restart.
- Alerts fire and resolve.
- Configuration changes apply.

The product must preserve time, provenance, and relationships between facts.

## Decision

Use an event-driven domain model centered on canonical infrastructure events.

This is a product domain choice, not a decision to introduce a distributed event bus.

## Alternatives

### Dashboard-Centric Model

Pros:

- Familiar to users.
- Easier to present visually.

Cons:

- Optimizes for display, not reasoning.
- Risks becoming a weaker Grafana clone.

### Entity-Centric CRUD Model

Pros:

- Simple to implement.
- Easy to map to database tables.

Cons:

- Misses the core question: what happened over time?
- Relationships and timelines become secondary instead of foundational.

## Tradeoffs

An event-driven domain model requires careful normalization and idempotency. That is worth the cost because trustworthy timelines are the core product experience.

## Consequences

- Every source integration must produce canonical events.
- Every event must preserve evidence.
- Timeline and relationship features become first-class.
- Event quality must be observable.

