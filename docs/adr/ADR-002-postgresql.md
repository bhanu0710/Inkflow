# ADR-002: Use PostgreSQL as the System of Record

## Status

Proposed

## Context

Infragence needs trustworthy persistence for events, entities, relationships, investigations, memory, and audit logs. The product depends on queryable structure, relational integrity, timestamps, provenance, and operational maturity.

## Decision

Use PostgreSQL as the primary database for the MVP.

## Alternatives

### Graph Database

Pros:

- Natural representation for infrastructure relationships.
- Powerful graph traversal.

Cons:

- Adds operational complexity.
- Makes MVP deployment heavier.
- Relationship quality is more important than graph database choice at this stage.

### Document Database

Pros:

- Flexible payload storage.
- Fast iteration on schemaless source data.

Cons:

- Weak fit for relational constraints.
- Can encourage unstructured event blobs.
- Harder to enforce evidence, relationship, and audit integrity.

### Time-Series Database

Pros:

- Strong fit for metrics and high-volume time data.

Cons:

- Infragence is not a metrics backend.
- Events and relationships need richer relational structure.

## Tradeoffs

PostgreSQL is not a specialized graph or time-series engine, but it is mature, reliable, widely understood, and strong enough for the MVP.

## Consequences

- Model relationships explicitly in relational tables.
- Add indexes around timeline and entity queries.
- Consider partitioning event tables only when volume requires it.
- Revisit graph storage after relationship workflows prove durable product value.

