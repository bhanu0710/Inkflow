# RFC-001: Engineering Memory

## Status

Draft

## Summary

Engineering Memory is the durable knowledge layer of Infragence. It stores verified findings, operational patterns, service notes, and investigation outcomes so future incidents benefit from prior learning.

## Problem

Infrastructure teams repeatedly rediscover the same context:

- A deployment pattern that often causes restarts.
- A service that is noisy during a specific batch job.
- A recurring alert that is harmless in one environment but serious in another.
- A prior incident caused by a missing configuration change.

This knowledge is often scattered across Slack, tickets, runbooks, personal memory, and incident notes.

## Goals

- Preserve useful investigation conclusions.
- Link memory to events, entities, and investigations.
- Distinguish human-authored conclusions from machine-derived facts.
- Make prior memory discoverable during future investigations.
- Support confidence and staleness.

## Non-Goals

- Replace runbooks.
- Become a general wiki.
- Generate conclusions without evidence.
- Require an LLM for memory creation or retrieval.

## Proposed Model

Memory records should include:

- memory_type
- title
- body
- linked entities
- linked events
- source investigation
- confidence
- verification status
- created_by
- verified_by
- created_at
- updated_at

## Memory Types

Initial memory types:

- confirmed_finding
- known_issue
- operational_pattern
- service_note
- remediation_note

## User Experience

Users should be able to:

- Create memory from a closed investigation.
- Attach memory to a workload, namespace, alert, or repository.
- Mark memory as verified or stale.
- See relevant memory when investigating a related event.
- Understand why memory was suggested.

## Data Quality Requirements

- Memory must include provenance.
- Machine suggestions must not appear as verified human knowledge.
- Stale memory should remain visible but clearly marked.
- Deleted memory should leave an audit record.

## Open Questions

- Should memory creation require investigation closure?
- Should memory support expiration dates?
- What similarity rules are acceptable before a knowledge graph or vector database exists?

