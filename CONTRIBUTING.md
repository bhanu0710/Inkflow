# Contributing

## Current Phase

Infragence is currently in the product and engineering foundation phase. Contributions should focus on documentation, architecture review, product scope, and technical design until implementation is explicitly approved.

## Contribution Workflow

1. Read the product foundation documents.
2. For major technical decisions, propose or update an ADR.
3. For major features, propose or update an RFC.
4. Keep MVP scope narrow and evidence-focused.
5. Do not add implementation code before approval.

## Pull Request Expectations

Every pull request should include:

- Clear summary
- Motivation
- Scope
- Testing or review evidence
- Risk assessment
- Follow-up work, if any

Documentation PRs should answer:

- What decision or product surface changed?
- Which documents were updated?
- What tradeoffs are being introduced?

## Decision Standards

Good Infragence contributions should improve at least one of:

- Evidence quality
- Timeline clarity
- Relationship accuracy
- Investigation workflow
- Engineering memory
- Security posture
- Operability
- Developer experience

## Security Rules

Never commit:

- API keys
- Cloud credentials
- kubeconfigs
- Terraform state
- Production logs
- Raw customer payloads
- Private incident data
- Secrets inside examples

Use sanitized examples and synthetic fixtures only.

## Review Culture

Review should be direct, specific, and evidence-based. Architecture disagreement is expected. The standard is not whether an idea is easy to build, but whether it helps Infragence become a trustworthy infrastructure intelligence platform.

