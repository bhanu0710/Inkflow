# Error Handling

## Standard Error Contract

All API errors must use this response shape:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message.",
    "requestId": "request-id"
  }
}
```

## Error Fields

| Field | Meaning |
| --- | --- |
| `success` | Always `false` for failed requests. |
| `error.code` | Stable machine-readable error code. |
| `error.message` | Safe client-facing message. |
| `error.requestId` | Request correlation ID. |

## Error Categories

| Category | HTTP Status | Example Code |
| --- | --- | --- |
| Validation | `400` | `VALIDATION_ERROR` |
| Authentication | `401` | `UNAUTHENTICATED` |
| Authorization | `403` | `FORBIDDEN` |
| Not found | `404` | `RESOURCE_NOT_FOUND` |
| Conflict | `409` | `RESOURCE_CONFLICT` |
| Rate limit | `429` | `RATE_LIMIT_EXCEEDED` |
| Internal | `500` | `INTERNAL_SERVER_ERROR` |

## Rules

- Do not expose stack traces to clients.
- Include request ID in every error response.
- Log internal errors with the request ID.
- Return safe messages for authentication and authorization failures.
