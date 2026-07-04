# RFC-004: Knowledge Graph

## Status

Draft

## Summary

The Knowledge Graph is the long-term representation of infrastructure relationships, operational facts, and engineering memory. The MVP should model graph-like relationships in PostgreSQL before introducing a dedicated graph database.

## Problem

Infrastructure is connected:

- Repositories produce commits.
- Commits trigger deployments.
- Deployments update workloads.
- Workloads emit metrics.
- Metrics trigger alerts.
- Alerts lead to investigations.
- Investigations create memory.

Without a relationship model, Infragence becomes another event list.

## Goals

- Represent infrastructure relationships explicitly.
- Support relationship confidence.
- Link events, entities, investigations, and memory.
- Enable impact and dependency questions over time.
- Provide a path to a dedicated graph store later if needed.

## Non-Goals

- Introduce a graph database in the MVP.
- Build arbitrary graph visualization as the first UI.
- Treat temporal correlation as confirmed causality.
- Hide relationship derivation details.

## Initial Graph Objects

Nodes:

- entity
- event
- investigation
- memory_record
- source

Edges:

- contains
- affects
- references
- triggered_by
- deployed_from
- correlated_with
- caused_by_candidate
- confirmed_by
- rejected_by

## Confidence

Edges should include:

- confidence level
- derivation method
- evidence event
- observed_at
- created_by

## MVP Storage

Use PostgreSQL relationship tables for the MVP.

Reasons:

- Simpler operations
- Transactional consistency
- Easier local development
- Enough power for early relationship queries

## Future Graph Store Criteria

Consider a graph database only when:

- Relationship query complexity exceeds PostgreSQL comfort.
- Users need multi-hop dependency queries at scale.
- Graph traversal becomes a core paid product surface.
- Operational maturity is ready for another stateful system.

## Open Questions

- What relationship vocabulary is stable enough for v1?
- How should rejected relationships influence future suggestions?
- Which graph queries matter enough to become first-class product workflows?

