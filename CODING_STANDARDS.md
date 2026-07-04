# Coding Standards

## Purpose

These standards define how Infragence should be built once implementation begins. They exist now so product architecture and code quality evolve together.

## Engineering Principles

- Prefer explicit domain concepts over generic utility layers.
- Keep source ingestion separate from product reasoning.
- Make uncertainty visible in data structures and UI.
- Preserve evidence and provenance.
- Design for testability from the first implementation commit.
- Optimize for maintainability before cleverness.

## TypeScript Standards

Future frontend standards:

- Use TypeScript in strict mode.
- Prefer explicit domain types for events, entities, relationships, and investigations.
- Keep API client contracts generated or centrally defined.
- Avoid untyped API response handling.
- Keep UI components small and workflow-focused.
- Use shadcn/ui consistently if adopted.

## Python Standards

Future backend standards:

- Use Python type hints for application code.
- Use Pydantic schemas at API and boundary layers.
- Keep database persistence separate from domain logic.
- Use service modules for domain workflows.
- Keep source connector clients isolated from normalization logic.
- Avoid global mutable state.

## Domain Standards

- Every event-producing path must preserve source, timestamp, and evidence metadata.
- Every derived relationship must expose confidence and derivation source.
- Human-authored conclusions must not overwrite machine facts.
- Failed normalization must be observable and testable.
- Product workflows should handle partial data explicitly.

## Testing Standards

Required future test categories:

- Unit tests for normalizers
- Unit tests for relationship resolution
- Contract tests for API responses
- Integration tests for database queries
- Fixture-based tests for Kubernetes, GitHub, and Prometheus payloads
- End-to-end tests for timeline and investigation workflows

## Review Standards

Code review should ask:

- Does this preserve evidence?
- Does this make confidence visible?
- Is this source-specific logic leaking into the domain layer?
- Can this be tested with fixtures?
- Does this introduce operational complexity without product proof?

## Documentation Standards

Major changes require one of:

- ADR for architectural decision
- RFC for major feature proposal
- Runbook for operational behavior
- Product doc update for user-facing workflow change

