# Rate Limiting

## Purpose

Rate limiting protects the API from abuse and keeps the platform compatible with
free-tier infrastructure.

Implementation is deferred. Endpoint categories and proposed limits are frozen
here for future implementation.

## Endpoint Categories

| Category | Examples | Proposed Limit |
| --- | --- | --- |
| Authentication sensitive | login, refresh token | 5 requests per minute per IP and account identifier |
| Authentication general | signup, logout | 10 requests per minute per IP |
| Write operations | create post, save draft, create comment | 30 requests per minute per authenticated user |
| Toggle operations | like, bookmark | 60 requests per minute per authenticated user |
| Read operations | feeds, post reads, tag lists | 120 requests per minute per IP |
| Health probes | health, ready, live | Exempt or separately limited at infrastructure level |

## Future Storage

Redis is the preferred future backing store for distributed rate limiting.

## Rules

- Rate limit failures must return `429`.
- Rate limit responses must use the standard error contract.
- Sensitive authentication endpoints must not reveal whether an account exists.
