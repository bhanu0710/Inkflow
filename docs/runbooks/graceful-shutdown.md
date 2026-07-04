# Graceful Shutdown Runbook

## Purpose

The backend must shut down safely for local Docker usage and future Kubernetes
termination.

## Expected Flow

```mermaid
sequenceDiagram
  participant Runtime
  participant Backend
  participant HTTP
  participant Prisma

  Runtime->>Backend: SIGTERM or SIGINT
  Backend->>HTTP: Stop accepting new requests
  HTTP-->>Backend: Existing requests completed or server closed
  Backend->>Prisma: Disconnect
  Prisma-->>Backend: Disconnected
  Backend-->>Runtime: Exit
```

## Failure Mode

If graceful shutdown exceeds the configured timeout, the process exits with a
failure code.
