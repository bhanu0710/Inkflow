# InkFlow Pull Request Review Checklist

This checklist must be reviewed and verified before any pull request is merged into the main branch.

## Correctness

- [ ] Code performs its intended function accurately under all conditions.
- [ ] Edge cases, error paths, and boundary conditions are handled properly.
- [ ] Types are correctly defined and used; no use of `any` types.

## Security

- [ ] Inputs are fully validated at the API boundary using Zod.
- [ ] Passwords are hashed using bcrypt.
- [ ] Refresh tokens are hashed before storage.
- [ ] No secrets, tokens, or private credentials are hardcoded or logged.
- [ ] Output Markdown is sanitized before being rendered to prevent XSS.
- [ ] Internal errors (e.g. database stack traces) are caught and not leaked to the user.

## Architecture

- [ ] The layer flow restriction is respected: Route ➔ Middleware ➔ Validation ➔ Controller ➔ Service ➔ Repository ➔ Prisma ➔ Database.
- [ ] Controllers deal only with HTTP protocols (parsing requests, returning responses) and contain no business logic.
- [ ] Services contain all business and orchestration rules.
- [ ] Repositories are the _only_ layer executing Prisma queries.
- [ ] Code is modular, functions are cohesive, and unnecessary abstractions are avoided.

## Performance

- [ ] Heavy database queries are optimized or paginated.
- [ ] Redis caching is used where appropriate to prevent unnecessary database load.
- [ ] No blocking synchronous calls are performed in the event loop.

## Database

- [ ] Prisma schemas are updated using migrations only (`prisma migrate dev`). No `prisma db push`.
- [ ] Database indexes are added on fields commonly queried.

## DevOps

- [ ] Dockerfiles and Docker Compose files are updated if configuration changes.
- [ ] Application configuration variables are read from environment variables and validated on startup.
- [ ] Code remains Kubernetes-ready and decoupled from container runtime layers.

## Documentation

- [ ] APIs are documented in OpenAPI specs/Swagger UI if new routes are added.
- [ ] Internal architecture documents/READMEs are updated where necessary.

## Testing

- [ ] New functionality is covered with unit/integration tests (using Vitest/Supertest).
- [ ] Regression tests run successfully and all tests pass.

## Scope

- [ ] Changes do not exceed the scope of the requested Engineering Story.
- [ ] Unrelated files are not modified.

## Operational Impact

- [ ] Structured logging using Pino is used instead of `console.log`.
- [ ] Health checks (/health, /live, /ready) reflect runtime status accurately.
- [ ] Graceful shutdown logic handles new resources correctly (SIGTERM/SIGINT signals).
