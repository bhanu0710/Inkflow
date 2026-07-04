# Pagination

## Strategy

Different InkFlow resources use different pagination strategies based on access
patterns.

| Resource | Strategy | Reason |
| --- | --- | --- |
| Homepage feed | Cursor pagination | Feed content changes frequently; cursor pagination avoids duplicates and missing records during writes. |
| Comments | Offset pagination | Comments are viewed within a bounded post context and often need page-style navigation. |
| Tags | Offset pagination | Tags are small, stable, and easy to sort alphabetically or by usage. |
| User posts | Offset pagination | User profile pages are scoped to one author and support predictable page navigation. |

## Cursor Pagination

Homepage cursor pagination should use a stable ordering key:

```text
published_at DESC, id DESC
```

The cursor must encode enough information to continue from the previous page.

## Offset Pagination

Offset pagination must enforce maximum page sizes.

Each offset-paginated endpoint must define:

- `page`
- `limit`
- maximum allowed `limit`
- deterministic sort order

## Response Metadata

Paginated responses should include pagination metadata inside the response data
object. The exact fields are endpoint-specific.
