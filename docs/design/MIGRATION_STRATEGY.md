# Migration Strategy

## Tooling

InkFlow uses Prisma migrations.

## Commands

| Environment | Command |
| --- | --- |
| Development | `prisma migrate dev` |
| CI | `prisma migrate deploy` |
| Production | `prisma migrate deploy` |

## Philosophy

- Migrations are committed to source control.
- Schema changes must be reviewed like application code.
- Production migrations must be deterministic.
- Data-destructive migrations require explicit review.
- Application code and migrations should be deployed in a compatible order.

## CI Expectations

CI should verify that migrations apply cleanly against a fresh PostgreSQL
database before application tests run.

## Production Expectations

Production deployments should run `prisma migrate deploy` before starting the
new backend version.
