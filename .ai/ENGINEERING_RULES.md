# InkFlow Engineering Rules

This document details the mandatory engineering constraints, rules, and procedures for the InkFlow repository.

## Coding Rules

- **Production-Quality Code**: Always write production-quality code. Never write demo code or create placeholder/stub implementations.
- **Clean and Complete**: Never leave unfinished code. Never add TODO comments.
- **Logging**: Never use `console.log`. Always use `Pino` structured logging.
- **Privacy and Secrets**: Never expose secrets. Never log sensitive fields (passwords, JWTs, refresh tokens).
- **Simplicity**: Prefer explicit code over clever code. Keep functions cohesive. Avoid unnecessary abstractions.
- **Abstraction**: Do not introduce libraries without explicit approval.

## Architecture Rules

- **Strict Flow Restriction**: Route ➔ Middleware ➔ Validation ➔ Controller ➔ Service ➔ Repository ➔ Prisma ➔ PostgreSQL.
- **Controllers**: HTTP boundary only. Parsing inputs, routing requests, returning HTTP responses. Never contain business logic.
- **Services**: Business logic and orchestration only.
- **Repositories**: Only layer allowed to access Prisma. Direct access to Prisma queries elsewhere is forbidden.
- **Prisma**: Persistence only. Never contains business logic.

## Security Rules

- **OWASP Best Practices**: Follow standard OWASP security recommendations.
- **Zero Trust Client**: Never trust client inputs. Always sanitize Markdown before rendering.
- **Cryptographic Hashing**: Hash passwords using `bcrypt`.
- **Session Tokens**: Store only hashed refresh tokens in the database.
- **Fail Securely**: Catch all errors and never leak internal details or stack traces to HTTP responses.

## Database Rules

- **ORM**: Use Prisma.
- **No DB Push**: Never run `prisma db push`. Always use Prisma Migrations (`prisma migrate dev`).
- **Immutable History**: Migration history must not be edited or deleted.
- **Boundary**: All Prisma operations belong exclusively within Repositories. Business constraints belong inside Services.

## Git Rules

- **Small Commits**: Keep changes small, coherent, and tightly focused.
- **Unrelated Changes**: Do not commit changes to unrelated files.
- **Workflow Compliance**: Never proceed with next Engineering Story without a successful PR review and merge of the current one.

## Scope Rules

- **Limited Scope**: Implement _only_ the requested scope in the active Engineering Story.
- **Blockers**: If blocked, STOP, explain the issue, and wait for approval. Never guess.

## Validation Rules

- **Zod Validation**: Validate every input at the controller/middleware boundary.
- **Pre-Merge Validation**: Before committing/pushing, ensure the project builds successfully, all linter checks pass, and all tests run cleanly.
