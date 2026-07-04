# Domain Model

## Overview

Infragence models infrastructure as a time-aware graph of entities, events, relationships, investigations, and memory.

The domain model must support evidence-backed reasoning without requiring an LLM.

## Core Concepts

### Organization

An organization represents a customer account or company boundary.

Key attributes:

- id
- name
- created_at
- status

### Workspace

A workspace is an operating boundary within an organization. The MVP can use one workspace per organization, but the concept prevents future redesign.

Key attributes:

- id
- organization_id
- name
- environment

### Source

A source is an external system connected to Infragence.

Examples:

- Kubernetes cluster
- GitHub repository
- Prometheus instance

Key attributes:

- id
- workspace_id
- source_type
- name
- connection_status
- last_seen_at

### Entity

An entity is an infrastructure object that can be referenced by events.

Examples:

- Kubernetes cluster
- Namespace
- Deployment
- StatefulSet
- Pod
- Service
- GitHub repository
- Pull request
- Commit
- Prometheus alert

Key attributes:

- id
- workspace_id
- entity_type
- external_id
- display_name
- labels
- first_seen_at
- last_seen_at

### Event

An event is a normalized fact that happened at a specific time.

Examples:

- Deployment updated
- Pod restarted
- Pull request merged
- Commit pushed
- Alert fired
- Alert resolved

Key attributes:

- id
- workspace_id
- source_id
- event_type
- occurred_at
- ingested_at
- severity
- summary
- confidence

### Relationship

A relationship connects two domain objects.

Examples:

- Event affects entity
- Pull request contains commit
- Commit triggered deployment
- Alert references workload
- Namespace contains workload

Key attributes:

- id
- workspace_id
- subject_type
- subject_id
- relationship_type
- object_type
- object_id
- confidence
- observed_at

### Timeline

A timeline is a query result, not a separate source of truth. It orders events and relationships around a context.

Timeline contexts:

- Entity
- Alert
- Investigation
- Time range
- Source

### Investigation

An investigation groups evidence, notes, and conclusions around a question.

Examples:

- Why did latency increase?
- What happened before this alert?
- Which deployment is related to this incident?

Key attributes:

- id
- workspace_id
- title
- status
- opened_at
- closed_at
- created_by
- confidence_summary

### Engineering Memory

Engineering memory stores durable knowledge produced by investigations and human review.

Memory types:

- confirmed_finding
- known_issue
- service_note
- operational_pattern
- remediation_note

Memory must distinguish facts from human interpretation.

## Relationship Types

Initial relationship vocabulary:

- contains
- owns
- affects
- references
- triggered_by
- caused_by_candidate
- correlated_with
- deployed_from
- resolved_by
- observed_on

The product should be careful with `caused_by_candidate`. Causality should remain tentative unless confirmed by a user or a strong deterministic rule.

## Confidence Model

Relationship confidence should be explicit:

- high: deterministic mapping, such as source identifier match
- medium: strong heuristic, such as matching deployment SHA
- low: temporal or label-based correlation only
- confirmed: human-confirmed relationship
- rejected: human-reviewed false relationship

## Domain Rules

- Every event must belong to a workspace and source.
- Every event must preserve original source identity.
- Every relationship must expose how it was created.
- Human conclusions must be stored separately from machine-derived relationships.
- Timeline views must show source and confidence metadata.

