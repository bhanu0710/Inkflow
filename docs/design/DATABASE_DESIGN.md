# Database Design

## Database

InkFlow uses PostgreSQL with Prisma.

Repositories are the only layer allowed to access Prisma. Services own business
logic and transactions.

## Entity Relationships

```mermaid
erDiagram
  users {
    uuid id PK
    text username UK
    text email UK
    text display_name
    text password_hash
    timestamp created_at
    timestamp updated_at
  }

  posts {
    uuid id PK
    uuid author_id FK
    text title
    text slug UK
    text markdown
    text status
    int reading_time_minutes
    timestamp published_at
    timestamp created_at
    timestamp updated_at
  }

  comments {
    uuid id PK
    uuid post_id FK
    uuid author_id FK
    uuid parent_id FK
    text body
    int depth
    timestamp created_at
    timestamp updated_at
  }

  tags {
    uuid id PK
    text name UK
    timestamp created_at
  }

  post_tags {
    uuid post_id FK
    uuid tag_id FK
  }

  likes {
    uuid user_id FK
    uuid post_id FK
    timestamp created_at
  }

  bookmarks {
    uuid user_id FK
    uuid post_id FK
    timestamp created_at
  }

  refresh_tokens {
    uuid id PK
    uuid user_id FK
    text token_hash
    timestamp expires_at
    timestamp revoked_at
    timestamp created_at
  }

  users ||--o{ posts : writes
  users ||--o{ comments : writes
  users ||--o{ likes : creates
  users ||--o{ bookmarks : creates
  users ||--o{ refresh_tokens : owns
  posts ||--o{ comments : receives
  posts ||--o{ likes : receives
  posts ||--o{ bookmarks : receives
  posts ||--o{ post_tags : has
  tags ||--o{ post_tags : joins
  comments ||--o{ comments : nests
```

## Index Strategy

| Table | Index | Reason |
| --- | --- | --- |
| `users` | unique `username` | Enforces immutable unique usernames. |
| `users` | unique `email` | Enforces one account per email. |
| `posts` | unique `slug` | Supports immutable public post URLs. |
| `posts` | `author_id, created_at` | Supports user post lists. |
| `posts` | `status, published_at, id` | Supports homepage cursor pagination. |
| `comments` | `post_id, created_at` | Supports post comment lists. |
| `comments` | `parent_id` | Supports nested comment lookup. |
| `comments` | `author_id, created_at` | Supports user deletion and future user comment views. |
| `tags` | unique `name` | Prevents duplicate tag records. |
| `post_tags` | unique `post_id, tag_id` | Prevents duplicate tag assignment. |
| `post_tags` | `tag_id, post_id` | Supports tag-filtered post lookup. |
| `likes` | unique `user_id, post_id` | Enforces toggle uniqueness. |
| `likes` | `post_id` | Supports like counts. |
| `bookmarks` | unique `user_id, post_id` | Enforces toggle uniqueness. |
| `bookmarks` | `user_id, created_at` | Supports user bookmark lists. |
| `refresh_tokens` | `user_id` | Supports logout-all and user deletion. |
| `refresh_tokens` | unique `token_hash` | Supports token lookup and revocation. |
| `refresh_tokens` | `expires_at` | Supports cleanup of expired tokens. |

## Deletion Strategy

User deletion is hard delete.

The service layer must orchestrate deletion inside a Prisma transaction in this
order:

1. Refresh tokens
2. Bookmarks
3. Likes
4. Comments
5. Posts
6. User

Broad `ON DELETE CASCADE` rules must not be used as the primary deletion
mechanism. Foreign keys may still protect referential integrity.
