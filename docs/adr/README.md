# Architecture Decision Records

ADRs document significant technical decisions for Infragence. Each ADR should include context, decision, alternatives, tradeoffs, and consequences.

## Records

- [ADR-001: Use a Modular Monolith for the MVP](ADR-001-modular-monolith.md)
- [ADR-002: Use PostgreSQL as the System of Record](ADR-002-postgresql.md)
- [ADR-003: Use FastAPI for the Backend](ADR-003-fastapi.md)
- [ADR-004: Use an Event-Driven Domain Model](ADR-004-event-driven-domain-model.md)
- [ADR-005: Build Infrastructure Intelligence, Not an AI Chatbot](ADR-005-infrastructure-intelligence-not-ai-chat.md)

## When to Add an ADR

Add or update an ADR when a decision:

- Is expensive to reverse.
- Changes system boundaries.
- Introduces a new stateful dependency.
- Changes security, data retention, or tenant isolation.
- Establishes a long-lived product or engineering principle.

