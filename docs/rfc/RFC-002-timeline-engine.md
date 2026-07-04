# RFC-002: Timeline Engine

## Status

Draft

## Summary

The Timeline Engine creates ordered operational context across events, entities, sources, and relationships.

## Problem

During incidents, engineers manually reconstruct time order:

- Which PR merged?
- Which deployment rolled out?
- Which pod restarted?
- Which alert fired?
- Which metric changed?

Existing tools show isolated slices. Infragence should build the cross-source operational story.

## Goals

- Provide ordered event timelines.
- Support entity, alert, investigation, source, and custom time-range contexts.
- Preserve evidence links.
- Show relationship confidence.
- Warn about missing or partial data.

## Non-Goals

- Replace time-series dashboards.
- Store raw metric samples.
- Claim root cause automatically.
- Hide low-confidence data.

## Timeline Contexts

Initial contexts:

- workload timeline
- namespace timeline
- repository timeline
- alert timeline
- investigation timeline
- custom time range

## Timeline Response Requirements

Each timeline item should include:

- event_id
- event_type
- occurred_at
- source
- summary
- severity
- related_entities
- relationships
- confidence
- evidence_uri
- data_quality_warnings

## Ordering Rules

- Primary sort by occurred_at.
- Tie-break by source priority and ingested_at.
- Preserve source timestamp and ingestion timestamp separately.
- Surface clock skew when detected.

## Data Quality Warnings

Examples:

- source_unavailable
- partial_results
- missing_evidence_link
- low_confidence_relationship
- normalization_failure_nearby
- possible_clock_skew

## Open Questions

- Should timelines include low-severity events by default?
- Should the product provide timeline compression for noisy event bursts?
- How should alert windows be calculated for pre-alert and post-alert context?

