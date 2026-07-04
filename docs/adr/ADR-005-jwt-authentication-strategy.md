# ADR-005: JWT Authentication Strategy

## Status

Accepted

## Decision

InkFlow uses JWT access tokens and JWT refresh tokens.

Refresh tokens are stored only as hashes.

## Lifecycle

- Access tokens expire after 15 minutes.
- Refresh tokens expire after 30 days.
- Refresh token rotation is required.
- Logout revokes the current refresh token.
- Logout all revokes all refresh tokens for the user.
- Reuse detection is reserved for future hardening.

## Consequences

The system can authenticate without server-side access-token storage while still
supporting refresh-token revocation.
