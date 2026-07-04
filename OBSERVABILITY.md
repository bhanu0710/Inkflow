# Observability

## Observability Philosophy

Infragence must be observable because it is itself an infrastructure product. Users will not trust infrastructure intelligence from a system that cannot explain its own behavior.

## Signals

The platform should emit:

- Logs
- Metrics
- Traces
- Audit events
- Data quality events

## Core Metrics

### Ingestion

- source_sync_success_total
- source_sync_failure_total
- source_sync_duration_seconds
- events_received_total
- events_deduplicated_total
- events_normalized_total
- events_normalization_failed_total

### Relationships

- relationships_created_total
- relationships_rejected_total
- relationships_by_confidence_total
- entity_resolution_failed_total

### Timeline

- timeline_query_duration_seconds
- timeline_query_events_returned
- timeline_partial_results_total
- timeline_low_confidence_results_total

### Investigations

- investigations_created_total
- investigations_closed_total
- investigation_evidence_added_total
- memory_records_created_total

### System

- api_request_duration_seconds
- api_request_errors_total
- database_query_duration_seconds
- redis_operation_errors_total
- background_job_duration_seconds

## Logs

Logs should be structured and include:

- request_id
- workspace_id
- source_id when relevant
- event_id when relevant
- investigation_id when relevant
- error_code

Logs must not include secrets, access tokens, or raw sensitive payloads.

## Traces

Trace important workflows:

- Source sync
- Event normalization
- Entity resolution
- Relationship resolution
- Timeline query
- Investigation creation

Traces should make slow source APIs and slow database queries easy to identify.

## Data Quality Observability

Infragence needs product-level observability, not just service health.

Track:

- Missing evidence links
- Partial normalization
- Low-confidence relationships
- Source sync gaps
- Timeline gaps
- Payload scrub failures

These should be visible to operators and, when relevant, to users.

## Alerts

Initial alert classes:

- Source sync failing repeatedly
- Normalization failure rate above threshold
- Timeline query latency above threshold
- Database unavailable
- Redis unavailable
- Payload scrub failure detected
- Audit log write failure

## Dashboards

Initial dashboards:

- Ingestion health
- Source health
- Data quality
- API performance
- Timeline query performance
- Background job health

## OpenTelemetry

Future implementation should use OpenTelemetry for traces and metrics instrumentation where practical. The product should be easy to run with Prometheus and Grafana in the MVP environment.

