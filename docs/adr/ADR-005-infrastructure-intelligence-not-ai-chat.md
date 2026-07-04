# ADR-005: Build Infrastructure Intelligence, Not an AI Chatbot

## Status

Proposed

## Context

The product vision includes future reasoning and optional AI. However, building the MVP around chat would risk producing unsupported explanations over weak data.

The market does not need another generic chat interface pasted onto infrastructure APIs. It needs evidence-backed operational understanding.

## Decision

Build Infragence as an infrastructure intelligence platform first. AI-assisted features may be added later only on top of verified events, relationships, timelines, and memory.

## Alternatives

### AI Chat First

Pros:

- Fast demo path.
- Familiar interface.
- Easier to market.

Cons:

- High hallucination risk.
- Weak differentiation.
- Low trust for production engineering workflows.
- Encourages answer generation before evidence modeling.

### Dashboard First

Pros:

- Familiar operational interface.
- Easier to build initial screens.

Cons:

- Competes with mature dashboard products.
- Does not directly solve cross-tool reconstruction.

## Tradeoffs

Evidence-first infrastructure intelligence takes longer to build than a chat demo. The tradeoff is justified because trust is the product.

## Consequences

- The MVP must work without an LLM.
- Every future AI response must cite evidence.
- The product surface should expose uncertainty.
- Roadmap priority remains ingestion, relationships, timelines, and memory before assisted reasoning.

