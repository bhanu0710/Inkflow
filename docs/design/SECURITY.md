# Security

## Baseline

InkFlow security is designed around explicit validation, minimal trusted input,
and safe credential handling.

Frozen authentication decisions:

- No OAuth.
- No email verification.
- No image uploads.

## Passwords

- Passwords are stored only as bcrypt hashes.
- Raw passwords must never be logged.
- Password verification happens only inside authentication services.

## Tokens

- Access tokens are JWTs.
- Refresh tokens are JWTs.
- Access tokens expire after 15 minutes.
- Refresh tokens expire after 30 days.
- Refresh tokens rotate when used.
- Refresh token hashes are stored in the database.
- Raw refresh tokens must never be stored.
- JWTs must never be logged.

## HTTP Security

- Helmet is enabled.
- CORS is restricted by environment configuration.
- Request IDs are generated for every request.

## Logging Redaction

Pino redaction must cover:

- `req.headers.authorization`
- `req.headers.cookie`
- `password`
- `passwordHash`
- `token`
- `accessToken`
- `refreshToken`
- `refreshTokenHash`
- `authorization`

## Markdown Security

Markdown must be parsed and sanitized before rendering. Raw user-authored HTML
must not be trusted.

## Future Security Work

Future work may add rate limiting, centralized secret management, and additional
security headers. These must be introduced through approved implementation
tasks or ADRs when they affect architecture.
