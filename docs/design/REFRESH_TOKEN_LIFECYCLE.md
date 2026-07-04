# Refresh Token Lifecycle

## Token Types

| Token | Expiration | Storage |
| --- | --- | --- |
| Access token | 15 minutes | Client only |
| Refresh token | 30 days | Hash only in database |

## Rotation

Refresh tokens rotate when used.

On successful refresh:

1. Validate the submitted refresh token.
2. Verify that the stored hash exists and is not revoked or expired.
3. Revoke the used refresh token.
4. Issue a new access token.
5. Issue a new refresh token.
6. Store only the hash of the new refresh token.

## Logout

Logout revokes the current refresh token.

## Logout All

Logout all revokes every active refresh token for the authenticated user.

## Revocation

Revoked refresh tokens must not be accepted.

Revocation is required for:

- logout
- logout all
- user deletion
- refresh token rotation

## Reuse Detection

Refresh token reuse detection is reserved for future hardening.

When implemented, reuse detection should treat reuse of an already rotated token
as a possible credential theft signal.
