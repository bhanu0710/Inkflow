# ADR-004: Markdown-First Editor

## Status

Accepted

## Decision

InkFlow posts are Markdown only.

Manual draft saving is the approved draft behavior. Image uploads are not part
of the approved architecture.

## Rules

- Store canonical Markdown source.
- Parse, sanitize, syntax-highlight, and render Markdown before display.
- Treat Markdown as untrusted input.

## Consequences

The editor and storage model remain simple. The rendering pipeline must protect
against XSS.
