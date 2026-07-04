# RFC-003: Investigation Engine

## Status

Draft

## Summary

The Investigation Engine helps engineers group evidence, annotate findings, and produce durable operational conclusions.

## Problem

Investigation work often happens outside observability tools. Engineers collect links, compare timestamps, ask teammates, and eventually produce context that is lost after the incident.

Infragence should make investigation a first-class workflow.

## Goals

- Create investigations from alerts, entities, or time ranges.
- Attach relevant timeline events.
- Store human notes.
- Track status and ownership.
- Close investigations with evidence-backed conclusions.
- Convert useful conclusions into engineering memory.

## Non-Goals

- Replace incident management platforms.
- Manage paging or on-call schedules.
- Automatically remediate infrastructure.
- Generate authoritative root cause without user review.

## Investigation States

Initial states:

- open
- triaging
- identified
- mitigated
- closed
- archived

## Core Workflow

1. User opens investigation from alert, entity, or timeline.
2. System builds initial evidence timeline.
3. User reviews related events and relationships.
4. User adds notes and marks useful evidence.
5. User closes investigation with conclusion.
6. User optionally creates memory from the conclusion.

## Evidence Rules

- Evidence can be added manually or suggested by the system.
- Suggested evidence must include the reason it was suggested.
- Evidence relevance can be changed by the user.
- Rejected evidence should help improve future heuristics.

## Audit Requirements

Audit:

- investigation creation
- evidence added or removed
- notes added or updated
- status changes
- conclusion updates
- memory creation

## Open Questions

- Should investigations have owners in the MVP?
- Should investigation notes support markdown?
- Should the product support private notes, or keep all investigation notes workspace-visible?

