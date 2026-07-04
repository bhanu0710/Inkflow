# API Specification

## Overview

The API exposes infrastructure intelligence workflows to the web application and future integrations.

This document defines product contracts only. It does not create backend routes or implementation code.

## API Principles

- Evidence metadata must be returned with operational claims.
- Timeline APIs must be cursor-paginated.
- Mutation APIs must be auditable.
- Low-confidence relationships must be visible, not hidden.
- Error responses should be actionable for operators.

## Resource Groups

### Health

Purpose: verify service and dependency status.

Contracts:

- Read application readiness.
- Read dependency health for PostgreSQL, Redis, and configured sources.

### Sources

Purpose: manage connected systems.

Contracts:

- List sources.
- Read source details.
- Read source sync status.
- Trigger a manual source sync.
- Disable a source.

### Events

Purpose: query canonical infrastructure events.

Contracts:

- List events by workspace, time range, source, event type, severity, and entity.
- Read event detail.
- Read raw provenance metadata when authorized.
- List normalization failures.

### Entities

Purpose: inspect infrastructure objects.

Contracts:

- List entities by type and source.
- Read entity detail.
- Read entity relationships.
- Read entity timeline.

### Timelines

Purpose: construct ordered operational context.

Contracts:

- Build timeline for an entity.
- Build timeline for an alert.
- Build timeline for an investigation.
- Build timeline for a custom time range.

Timeline responses should include:

- events
- relationships
- confidence
- evidence_uri
- source
- ingestion status
- pagination cursor

### Investigations

Purpose: group evidence and human reasoning.

Contracts:

- Create investigation from an alert, entity, or time range.
- Read investigation summary.
- Add or remove evidence events.
- Add human notes.
- Close investigation with conclusion.
- Link investigation to memory.

### Engineering Memory

Purpose: preserve durable knowledge.

Contracts:

- Create memory record from investigation.
- List memory records.
- Search memory records.
- Link memory to entity or event.
- Mark memory as verified or stale.

### Audit

Purpose: expose sensitive mutations for review.

Contracts:

- List audit events by actor, target, action, and time range.
- Read audit detail.

## Response Metadata

Operational responses should include:

- request_id
- generated_at
- workspace_id
- data_quality_warnings

Data quality warnings may include:

- source_unavailable
- partial_timeline
- low_confidence_relationships
- missing_evidence_links
- normalization_failures_present

## Error Model

Errors should include:

- code
- message
- remediation_hint
- request_id
- details

Example error classes:

- unauthorized
- forbidden
- source_unavailable
- invalid_time_range
- event_not_found
- entity_not_found
- ingestion_incomplete
- rate_limited

## Versioning

The public API should use explicit versioning. The MVP can use one stable version namespace, but contracts should be designed for compatibility.

Breaking changes require:

- ADR or RFC
- migration plan
- client impact notes

