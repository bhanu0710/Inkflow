# InkFlow

InkFlow is a production-grade blogging platform foundation inspired by Medium.

## Vision

Build a maintainable SaaS blogging platform that can grow from a clean modular
monolith into a Kubernetes-ready production system.

```mermaid
flowchart LR
  Reader["Reader / Author"] --> Frontend["React Frontend"]
  Frontend --> Backend["Express Backend"]
  Backend --> Services["Services"]
  Services --> Repositories["Repositories"]
  Repositories --> PostgreSQL["PostgreSQL"]
  Backend --> Redis["Redis"]
```

## Architecture

The backend follows Clean Architecture boundaries.

```mermaid
flowchart TD
  Controller["Controllers\nvalidate request, call service, return response"]
  Service["Services\nbusiness rules and orchestration"]
  Repository["Repositories\nPrisma access only"]
  Database["PostgreSQL"]

  Controller --> Service
  Service --> Repository
  Repository --> Database
```

Current foundation scope:

- No authentication
- No blog APIs
- No frontend pages
- No application database models

The complete architecture-freeze documentation lives under `docs/`:

- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Domain Model](docs/design/DOMAIN_MODEL.md)
- [Database Design](docs/design/DATABASE_DESIGN.md)
- [API Specification](docs/api/API_SPECIFICATION.md)
- [Authorization](docs/design/AUTHORIZATION.md)
- [Security](docs/design/SECURITY.md)
- [Refresh Token Lifecycle](docs/design/REFRESH_TOKEN_LIFECYCLE.md)
- [Architecture Decision Records](docs/adr/README.md)

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Logging | Pino |
| Testing | Vitest, Supertest |
| API Docs | OpenAPI via Swagger UI |
| Local Runtime | Docker Compose |

## Folder Structure

```text
apps/
  backend/
    prisma/
    src/
      config/
      controllers/
      errors/
      health/
      lib/
        logger/
        metrics/
        swagger/
        tracing/
      middlewares/
      repositories/
      routes/
      services/
      types/
      validators/
    tests/
  frontend/
    src/
      components/
      features/
      lib/
      types/
docs/
scripts/
assets/
.github/
```

## Local Development

Create environment files:

```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Install dependencies:

```bash
npm install
```

Run verification:

```bash
npm run lint
npm run build
npm test
```

Run local services:

```bash
docker compose up --build
```

The compose stack starts:

- backend
- frontend
- PostgreSQL
- Redis

## Operational Foundation

```mermaid
flowchart TD
  Signal["SIGTERM / SIGINT"] --> Shutdown["Graceful shutdown"]
  Shutdown --> HttpClose["Stop accepting HTTP requests"]
  HttpClose --> PrismaDisconnect["Disconnect Prisma"]
  PrismaDisconnect --> Exit["Exit with status code"]

  Request["Incoming request"] --> RequestId["Request ID middleware"]
  RequestId --> Logs["Pino request logs"]
```

Included foundation:

- Environment validation during backend startup
- Request ID correlation for every HTTP request
- Pino application and HTTP logging
- HTTP compression
- Swagger UI initialized at `/docs`
- Kubernetes probe skeletons at `/health`, `/ready`, and `/live`
- Graceful shutdown for SIGTERM and SIGINT
- Non-root backend container runtime

## Project Roadmap

```mermaid
timeline
  title InkFlow Roadmap
  Sprint 0 : Production foundation
  Sprint 1 : Authentication foundation
  Sprint 2 : Author and profile domain
  Sprint 3 : Article publishing domain
  Sprint 4 : Reading and discovery workflows
  Sprint 5 : Production observability and deployment hardening
```

## Continuous Integration

Continuous Integration (CI) runs automatically via GitHub Actions on:
- Every push to the `main` branch.
- Every Pull Request targeting the `main` branch.

It enforces codebase standards and validation rules by executing the following pipeline sequentially:
1. **Checkout & Environment Setup**: Mounts Node.js 20 with eager NPM caching.
2. **Dependency Installation**: Executes clean installer via `npm ci`.
3. **ORM Code Generation**: Instantiates Prisma DB Client models.
4. **Static Analysis & Linting**: Runs ESLint checks across both frontend and backend.
5. **Compilation Verification**: Verifies full TypeScript builds compile with no errors.
6. **Test Suite Execution**: Ensures all integration and unit tests pass successfully.
7. **Docker Build Verification**: Verifies both application Dockerfiles build successfully under Docker Buildx.
8. **Security Vulnerability Scanning**: Automatically scans both images using Trivy, failing on CRITICAL vulnerabilities.



