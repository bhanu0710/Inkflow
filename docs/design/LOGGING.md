# Logging

## Logger

InkFlow uses Pino for application and HTTP logging.

## Request Correlation

Each request receives a request ID.

The request ID must be:

- accepted from `x-request-id` when present
- generated when absent
- returned in the `x-request-id` response header
- included in request logs
- included in API error responses

## Required Redaction

Pino must redact:

```text
req.headers.authorization
req.headers.cookie
password
passwordHash
token
accessToken
refreshToken
refreshTokenHash
authorization
```

## Log Levels

| Level | Use |
| --- | --- |
| `info` | lifecycle events, successful startup, graceful shutdown |
| `warn` | recoverable abnormal behavior |
| `error` | failed operations that require attention |
| `fatal` | unrecoverable process failure |
| `debug` | local development diagnostics |

## Rules

- Do not log secrets.
- Do not log raw tokens.
- Do not log passwords.
- Include request ID for request-scoped logs.
- Prefer structured fields over string interpolation.
