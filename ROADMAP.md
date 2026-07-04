# Roadmap

## Roadmap Philosophy

Infragence should avoid pretending to be an enterprise platform before it has validated the core product loop.

The roadmap should move in this order:

1. Evidence
2. Timelines
3. Relationships
4. Investigations
5. Memory
6. Reasoning
7. Automation

## Phase 0: Foundation

Goal: establish product and engineering foundation.

Deliverables:

- Product vision
- PRD
- Architecture documents
- Domain model
- Event model
- Database design
- API specification
- ADRs
- RFCs
- Security and observability plans

Exit criteria:

- MVP scope approved
- Core data model reviewed
- Major architecture decisions accepted
- Implementation plan approved

## Phase 1: Evidence Ingestion MVP

Goal: collect and normalize infrastructure events from one Kubernetes cluster, one GitHub repository, and one Prometheus instance.

Deliverables:

- Source connector framework
- Kubernetes event ingestion
- GitHub event ingestion
- Prometheus alert ingestion
- Raw envelope storage
- Canonical event storage
- Normalization failure visibility

Exit criteria:

- Events can be ingested and queried reliably.
- Duplicate events are handled.
- Evidence links are preserved.

## Phase 2: Entity and Relationship Layer

Goal: connect events to infrastructure entities.

Deliverables:

- Entity registry
- Relationship resolver
- Confidence model
- Relationship query APIs
- Basic entity detail views

Exit criteria:

- Users can see which events affected a workload, repository, or alert.
- Relationship confidence is visible.

## Phase 3: Timeline Engine

Goal: build trustworthy operational timelines.

Deliverables:

- Timeline query APIs
- Time range filtering
- Entity timeline
- Alert timeline
- Source and confidence metadata
- Data quality warnings

Exit criteria:

- Users can reconstruct what happened around an alert or deployment without leaving Infragence.

## Phase 4: Investigation Engine

Goal: turn timeline evidence into investigation workflows.

Deliverables:

- Investigation creation
- Evidence grouping
- Human notes
- Investigation status
- Conclusion capture

Exit criteria:

- Users can open, update, and close investigations with linked evidence.

## Phase 5: Engineering Memory

Goal: preserve durable operational knowledge.

Deliverables:

- Memory records
- Memory linked to entities and investigations
- Searchable history
- Verified and stale states

Exit criteria:

- Prior findings can help future investigations.

## Phase 6: Assisted Reasoning

Goal: add optional AI assistance over verified evidence.

Deliverables:

- Evidence-grounded summaries
- Investigation question answering
- Confidence and citation display
- Strict fallback when evidence is insufficient

Exit criteria:

- AI responses improve speed without reducing trust.

## Phase 7: Automation

Goal: recommend and eventually trigger safe operational actions.

Deliverables:

- Recommendation engine
- Approval workflows
- Audit controls
- Remediation playbooks

Exit criteria:

- Automation is explainable, reversible where possible, and audit-ready.

