# Event Model

## Purpose

The event model is the backbone of Infragence. It converts disconnected source facts into consistent operational evidence.

The event model must be precise enough for engineering trust and flexible enough to support new sources.

## Event Envelope

Every ingested event should have two layers:

1. Raw source envelope
2. Canonical event record

The raw envelope preserves where the data came from. The canonical event powers product workflows.

## Canonical Event Fields

Required fields:

- id
- workspace_id
- source_id
- event_type
- source_event_id
- occurred_at
- ingested_at
- summary
- severity
- actor_type
- actor_id
- entity_refs
- evidence_uri
- normalization_status
- normalizer_version

Optional fields:

- started_at
- ended_at
- correlation_key
- change_id
- deployment_id
- commit_sha
- pull_request_number
- namespace
- workload_name
- labels
- annotations
- raw_payload_ref

## Event Type Taxonomy

### Kubernetes Events

- kubernetes.namespace.created
- kubernetes.workload.created
- kubernetes.workload.updated
- kubernetes.workload.deleted
- kubernetes.pod.created
- kubernetes.pod.restarted
- kubernetes.pod.failed
- kubernetes.rollout.started
- kubernetes.rollout.completed
- kubernetes.rollout.failed

### GitHub Events

- github.pull_request.opened
- github.pull_request.merged
- github.pull_request.closed
- github.commit.pushed
- github.workflow.started
- github.workflow.completed
- github.workflow.failed

### Prometheus Events

- prometheus.alert.firing
- prometheus.alert.resolved
- prometheus.rule.evaluated
- prometheus.target.down
- prometheus.target.recovered

## Severity

Initial severity values:

- info
- warning
- error
- critical
- unknown

Severity should reflect operational relevance, not source verbosity.

## Event Identity and Idempotency

Events must be idempotent. The system should calculate a stable identity using:

- source_id
- source_event_id when available
- event_type
- occurred_at
- relevant entity identifier
- payload hash fallback

If a source does not provide stable event IDs, Infragence must document the deduplication strategy for that source.

## Evidence URI

Every event should link back to source evidence when possible.

Examples:

- Kubernetes object reference
- GitHub pull request URL
- GitHub workflow run URL
- Prometheus alert fingerprint
- Grafana panel URL, when configured

Evidence links are part of product trust. A timeline without evidence is just another opinionated feed.

## Normalization Status

Allowed values:

- pending
- normalized
- partially_normalized
- failed
- ignored

Failed and partially normalized events should be visible to operators. Silent data loss is unacceptable.

## Correlation Keys

Correlation keys help the relationship resolver connect facts across systems.

Examples:

- commit SHA
- image digest
- Kubernetes namespace
- workload name
- GitHub repository
- alert labels
- deployment revision

Correlation keys are hints, not conclusions.

## Design Challenge

The event model should resist the temptation to flatten everything into generic `message` fields. That path is easy early and expensive later.

Infragence needs structured facts because structured facts become timelines, relationships, and memory.

