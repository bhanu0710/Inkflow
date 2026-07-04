# Product Requirements Document

## Product

Infragence is an Infrastructure Intelligence Platform for platform, DevOps, cloud, and SRE teams.

## Problem

Engineering teams operate infrastructure through many systems. During incidents and reviews, they manually reconstruct what happened by switching between dashboards, logs, deployment records, pull requests, alerts, and cloud resources.

This manual reconstruction is slow, inconsistent, and dependent on senior engineers knowing where to look.

## Target Users

Primary:

- Platform Engineers
- DevOps Engineers
- Cloud Engineers
- Site Reliability Engineers

Target company size:

- 20 to 500 engineers

Initial infrastructure profile:

- AWS
- Kubernetes
- Terraform
- GitHub
- Prometheus
- Grafana

## MVP Goal

Validate that an evidence-backed infrastructure timeline and engineering memory layer helps engineers investigate changes faster than using disconnected tools directly.

## MVP Scope

The MVP supports:

- One Kubernetes cluster
- One GitHub repository
- One Prometheus instance
- Manual tenant setup
- Event ingestion from Kubernetes, GitHub, and Prometheus
- Entity relationship mapping for workloads, deployments, alerts, commits, and pull requests
- Timeline view for infrastructure events
- Basic investigation workflow
- Evidence links back to source systems

## Out of Scope for MVP

- Multi-cluster support
- Multi-tenant enterprise administration
- Automated remediation
- Cost intelligence
- Terraform drift detection
- Full knowledge graph database
- Vector database
- LLM-generated root cause analysis
- Replacing Prometheus, Grafana, or GitHub workflows

## Core User Journeys

### Journey 1: Understand What Changed

As a platform engineer, I want to see infrastructure changes in time order so I can quickly identify what happened before an alert or regression.

Acceptance criteria:

- User can filter timeline by service, namespace, repository, severity, and time range.
- Each event has a source, timestamp, entity association, and evidence link.
- Timeline makes ingestion gaps visible.

### Journey 2: Investigate an Alert

As an SRE, I want to start from a Prometheus alert and see nearby deployments, Kubernetes events, and GitHub changes.

Acceptance criteria:

- User can open an alert-backed investigation.
- System shows related events before and after the alert.
- System explains why events are related.
- System avoids unsupported root-cause claims.

### Journey 3: Preserve Engineering Memory

As a platform team, I want investigation notes and resolved findings to become searchable memory.

Acceptance criteria:

- User can attach a human conclusion to an investigation.
- Human conclusions are stored separately from machine-derived facts.
- Future investigations can reference prior similar events.

## Product Principles

- Infragence must make uncertainty visible.
- The product should prefer a precise partial answer over a broad speculative answer.
- Every conclusion should trace back to evidence.
- The UI should optimize for repeated engineering work, not marketing polish.
- AI should enhance reasoning only after the evidence model is strong.

## Metrics

Product metrics:

- Time to first useful timeline
- Number of events ingested per source
- Percentage of events linked to entities
- Investigations created from alerts
- Investigations with human conclusions
- Repeat investigations that reference prior memory

Quality metrics:

- Ingestion latency
- Event normalization failure rate
- Duplicate event rate
- Timeline query latency
- Evidence link completeness

## Risks

- The MVP can become too broad if it tries to solve monitoring, incident response, and AI reasoning at once.
- Poor event normalization will make every downstream feature weak.
- Relationship mapping is the hard product moat and must be treated as first-class.
- If evidence links are missing, users will not trust the system.

