# Security

## Security Philosophy

Security is a product requirement for Infragence. The platform connects to infrastructure systems, stores operational evidence, and may eventually support automation. Trust must be designed in from the beginning.

## Threat Model

Primary assets:

- Source system credentials
- Infrastructure event data
- Relationship and timeline data
- Investigation notes
- Engineering memory
- Audit logs
- Tenant configuration

Primary risks:

- Credential leakage
- Over-collection of sensitive payloads
- Cross-tenant data exposure
- Unauthorized investigation access
- Tampering with timelines or memory
- Insecure automation in future phases

## Credential Handling

Requirements:

- Store external tokens encrypted at rest.
- Never log tokens.
- Never include tokens in raw event envelopes.
- Use least-privilege source permissions.
- Support rotation without data loss.
- Audit credential changes.

## Data Handling

Requirements:

- Scrub raw payloads before persistence when sensitive data may appear.
- Store raw envelopes separately from normalized events.
- Retain raw envelopes only as long as needed.
- Make retention configurable by workspace.
- Use synthetic payloads in tests and examples.

## Access Control

Initial roles:

- owner
- admin
- engineer
- viewer

Access rules:

- Viewers can read timelines and investigations.
- Engineers can create investigations and memory records.
- Admins can manage sources.
- Owners can manage workspace settings and users.

The MVP can implement a simpler model, but the domain should not block these roles.

## Audit Requirements

Audit these actions:

- Source created, updated, disabled, or deleted
- Credentials changed
- Investigation created, closed, or reopened
- Memory record created, verified, marked stale, or deleted
- Relationship manually confirmed or rejected
- User or role changed

## Secure Defaults

- No public access by default.
- No secrets in repository.
- No production data in development fixtures.
- Deny unknown source payload fields from becoming trusted facts automatically.
- Fail closed on authorization ambiguity.

## Future Security Work

- SSO and SCIM
- Fine-grained RBAC
- Customer-managed encryption keys
- Private network connectivity
- Secret scanning in CI
- SOC 2 readiness controls

