# InkFlow

Production-grade cloud-native blogging platform.

## Mission

InkFlow is NOT just a Medium clone. It is a production-grade cloud-native blogging platform whose primary goal is to demonstrate professional software engineering, DevOps, cloud architecture, Kubernetes, CI/CD, observability, security, and operational excellence.

Every engineering decision must prioritize:

- Simplicity
- Maintainability
- Security
- Correctness
- Production readiness

_Speed is NEVER more important than quality._

## Tech Stack

### Frontend

- React
- TypeScript
- Vite

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Redis

### Infrastructure

- Docker
- Docker Compose

### Future Infrastructure

- Jenkins
- AWS EC2
- Kubernetes (kubeadm)
- Prometheus
- Grafana
- Loki
- OpenTelemetry
- Jaeger

## Folder Structure

```text
apps/
  backend/
    prisma/           # Database schema and migrations
    src/
      config/         # Configuration schema and setup
      controllers/    # HTTP Controllers
      errors/         # Custom API errors
      health/         # Liveness/readiness check routes
      lib/            # Instrumentation & logger initialization
      middlewares/    # Express middlewares
      repositories/   # Database access layer (Prisma only)
      routes/         # Router definitions
      services/       # Pure business logic layer
      types/          # Type and Interface definitions
      validators/     # Zod payload validators
    tests/            # Integration and unit tests
  frontend/
    src/
      components/     # Shared UI components
      features/       # Feature-based pages and modules
      lib/            # Third-party wrappers/clients
      types/          # Frontend types
docs/                 # Architecture Decision Records and Specifications
scripts/              # Auxiliary build and migration tools
```

## Architecture

### Request Flow

`Route` ➔ `Middleware` ➔ `Validation` ➔ `Controller` ➔ `Service` ➔ `Repository` ➔ `Prisma` ➔ `PostgreSQL`

### Layer Rules

- **Controllers**: HTTP protocol only. Do not contain business logic.
- **Services**: Business rules and orchestration only.
- **Repositories**: Only layer allowed to access Prisma.
- **Prisma**: Persistence only. Never contains business logic.

## Engineering Philosophy

- **Production-Quality Code**: Avoid demo code or placeholders.
- **Explicit > Clever**: Code readability, maintainability, and clean architecture are paramount.
- **Strict Boundaries**: Layers are strictly decoupled; interfaces and types are explicit.
- **No logs / secrets leaking**: All sensitive information is scrubbed and never output to stdout.

## Deployment Vision

- **Current**: Run locally inside Docker Compose with isolated backend, frontend, PostgreSQL, and Redis containers.
- **Future**: `Docker` ➔ `Jenkins` ➔ `AWS EC2` ➔ `Self-managed Kubernetes using kubeadm` ➔ `Ingress` ➔ `Observability`.
- Code remains cloud/platform-agnostic and Kubernetes-ready.
