# Deployment Architecture

## Deployment Philosophy

The MVP should be production-shaped without being over-engineered.

Infragence should start with a simple deployment topology that is easy to operate, observe, and secure. Complexity should be introduced only when product usage proves the need.

## MVP Deployment Components

- Next.js web application container
- FastAPI backend container
- Optional backend worker process
- PostgreSQL database
- Redis instance
- Prometheus and Grafana for platform observability

## Local Development

Future local development should provide:

- Web app
- API app
- PostgreSQL
- Redis
- Synthetic Kubernetes, GitHub, and Prometheus fixtures

Local development should not require access to production infrastructure.

## Cloud Deployment

Preferred cloud target: AWS.

Initial AWS shape:

- ECS or EKS for containers
- RDS PostgreSQL
- ElastiCache Redis
- Secrets Manager for credentials
- CloudWatch for platform logs
- S3 for retained payload references, if raw envelope storage requires object storage

EKS is not required on day one unless the product needs Kubernetes-native deployment validation. ECS may be a better first production choice for operational simplicity.

## Kubernetes Deployment

If deployed on Kubernetes:

- Use separate deployments for web and API.
- Use a worker deployment only when background processing requires it.
- Use network policies.
- Use read-only root filesystems where practical.
- Use resource requests and limits.
- Use liveness and readiness probes.
- Use external managed PostgreSQL and Redis for production.

## Environment Strategy

Recommended environments:

- local
- preview
- staging
- production

Preview environments should use sanitized fixtures by default.

## Configuration

Configuration should be environment-driven:

- Database connection
- Redis connection
- Source credentials
- Retention policy
- Feature flags
- Observability exporters

Secrets should never be committed to the repository.

## Release Strategy

Initial release strategy:

- Build containers in CI.
- Run tests and quality checks.
- Deploy to staging.
- Run smoke checks.
- Promote to production manually.

Automation can increase after rollback and observability are mature.

## Rollback Strategy

Requirements:

- Container image rollback
- Database migration rollback policy
- Feature flags for risky product surfaces
- Ability to disable source ingestion per workspace

Event ingestion must be idempotent so retries and rollbacks do not corrupt timelines.

## Production Readiness Gates

Before production launch:

- Authentication and authorization implemented
- Secrets stored outside code
- Audit log enabled
- Backups configured
- Restore tested
- Source sync retry strategy tested
- Ingestion idempotency tested
- Observability dashboards available
- Security review completed

