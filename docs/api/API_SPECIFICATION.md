# API Specification

## Style

InkFlow uses REST APIs under:

```text
/api/v1
```

Controllers must remain thin. Validation occurs before controller logic reaches
the service layer.

## Response Envelope

Successful responses use:

```json
{
  "success": true,
  "data": {}
}
```

Failed responses use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "requestId": "request-id"
  }
}
```

## API Categories

The following categories are approved for future implementation:

- Authentication
- Users
- Posts
- Drafts
- Comments
- Tags
- Likes
- Bookmarks
- Health

This document defines API behavior principles only. It does not implement
routes.

## Versioning

All product APIs must be versioned under `/api/v1`.

Health endpoints may remain outside API versioning because they are used by
runtime infrastructure:

- `/health`
- `/ready`
- `/live`
