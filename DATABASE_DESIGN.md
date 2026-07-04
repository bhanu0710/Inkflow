# Database Design

## Overview

PostgreSQL is the system of record for Infragence. The schema should be relational, auditable, and optimized around infrastructure timelines and relationship queries.

This document defines conceptual tables and constraints. It does not define implementation models.

## Schema Principles

- Store raw source envelopes separately from canonical events.
- Keep normalized facts queryable.
- Preserve evidence and provenance.
- Model relationships explicitly.
- Never store secrets in event payloads.
- Make data quality visible through status fields.

## Core Tables

### organizations

Purpose: customer account boundary.

Key columns:

- id
- name
- status
- created_at
- updated_at

### workspaces

Purpose: operating boundary for sources, entities, and investigations.

Key columns:

- id
- organization_id
- name
- environment
- created_at
- updated_at

### sources

Purpose: connected external systems.

Key columns:

- id
- workspace_id
- source_type
- name
- external_ref
- connection_status
- last_successful_sync_at
- last_failed_sync_at
- created_at
- updated_at

### raw_event_envelopes

Purpose: preserve source provenance and debug ingestion.

Key columns:

- id
- workspace_id
- source_id
- source_event_id
- received_at
- occurred_at
- payload_hash
- payload_ref
- scrub_status
- retention_expires_at

### events

Purpose: canonical event records.

Key columns:

- id
- workspace_id
- source_id
- raw_event_envelope_id
- event_type
- source_event_id
- occurred_at
- ingested_at
- severity
- summary
- evidence_uri
- normalization_status
- normalizer_version
- confidence
- metadata

### entities

Purpose: infrastructure objects.

Key columns:

- id
- workspace_id
- entity_type
- external_id
- display_name
- first_seen_at
- last_seen_at
- labels
- metadata

### relationships

Purpose: graph edges between domain objects.

Key columns:

- id
- workspace_id
- subject_type
- subject_id
- relationship_type
- object_type
- object_id
- confidence
- evidence_event_id
- created_by
- observed_at
- metadata

### investigations

Purpose: investigation workflow.

Key columns:

- id
- workspace_id
- title
- status
- opened_at
- closed_at
- created_by
- summary
- confidence_summary

### investigation_events

Purpose: link investigations to event evidence.

Key columns:

- investigation_id
- event_id
- relevance
- added_by
- added_at

### memory_records

Purpose: durable engineering knowledge.

Key columns:

- id
- workspace_id
- memory_type
- title
- body
- source_investigation_id
- confidence
- created_by
- verified_by
- created_at
- updated_at

### audit_log

Purpose: immutable audit trail for sensitive product actions.

Key columns:

- id
- workspace_id
- actor_id
- action
- target_type
- target_id
- occurred_at
- metadata

## Indexing Strategy

Required indexes:

- events(workspace_id, occurred_at)
- events(workspace_id, event_type, occurred_at)
- events(workspace_id, source_id, occurred_at)
- entities(workspace_id, entity_type, external_id)
- relationships(workspace_id, subject_type, subject_id)
- relationships(workspace_id, object_type, object_id)
- investigations(workspace_id, status, opened_at)
- memory_records(workspace_id, memory_type, created_at)

## Partitioning Strategy

Do not partition on day one unless data volume requires it. When needed, partition high-volume event tables by occurred_at, scoped by retention requirements.

The first partitioning candidate is `events`. The second is `raw_event_envelopes`.

## Retention

Default retention policy should be explicit:

- Raw envelopes: shorter retention, configurable
- Canonical events: longer retention
- Relationships: aligned with canonical events
- Investigations and memory: durable by default
- Audit logs: durable and protected

## Data Quality Controls

The database should make these states queryable:

- normalization failures
- scrub failures
- missing evidence links
- low-confidence relationships
- source sync failures

Data quality is part of the product surface.

