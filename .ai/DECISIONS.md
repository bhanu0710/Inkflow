# InkFlow Architecture Decisions

This document records the critical architectural decisions for the InkFlow blogging platform.

---

## 1. Username is Immutable

- **Decision**: A user's username cannot be changed after account creation.
- **Reason**: Prevents URL routing fragmentation (as user profiles are routed by username) and simplifies caching, auditing, and database indexing.
- **Trade-off**: Restricts user flexibility to rename their account; users must create a new account if they desire a new username.

## 2. Users are Hard Deleted

- **Decision**: When a user requests account deletion, their record is hard-deleted from the database.
- **Reason**: Simplifies GDPR compliance and storage reclaim procedures, avoiding complex logic needed to anonymize/soft-delete.
- **Trade-off**: Data recovery is impossible once deleted, requiring explicit warnings in the UI before execution.

## 3. Markdown Only for Articles

- **Decision**: Articles support Markdown syntax exclusively.
- **Reason**: Offers a lightweight, text-based storage format that separates content from layout, and matches standard developer blogging workflows.
- **Trade-off**: Requires rich text editors to convert to markdown on the client side and demands strict HTML sanitization on rendering.

## 4. Nested Comments Supported

- **Decision**: Comments on articles support nesting.
- **Reason**: Enables rich discussion threads and direct user-to-user interactions.
- **Trade-off**: Introduces database query complexity (hierarchical trees) and UI/UX challenges for deeply nested comments.

## 5. Maximum Comment Depth Enforced in Services

- **Decision**: The maximum allowed nesting depth for comments is checked and enforced within the Service layer.
- **Reason**: Keeps repositories focused strictly on data retrieval and controllers focused on HTTP protocols, placing the business constraint in the domain logic layer.
- **Trade-off**: Requires explicit fetch/query of parent comment ancestors or path tracking in Services.

## 6. Tags are User-Created

- **Decision**: Tags are created dynamically by users when drafting/publishing articles.
- **Reason**: Allows crowdsourced categorization, avoiding the need for administrative tag management overhead.
- **Trade-off**: Can lead to duplication, spelling variants, and tagging fragmentation (e.g., "javascript" vs "JS").

## 7. Refresh Tokens are Hashed

- **Decision**: Refresh tokens stored in the database are hashed using a cryptographic hashing function.
- **Reason**: Follows the security principle of defense in depth: if the database is compromised, active session refresh tokens cannot be stolen or used to forge access tokens.
- **Trade-off**: Increases CPU overhead during refresh token validation.

## 8. Repository is the Only Prisma Access Layer

- **Decision**: Direct usage of Prisma queries is strictly prohibited in controllers and services. All database operations must go through Repository classes.
- **Reason**: Decouples the application's business logic from the specific database client (Prisma) and enables cleaner testing through repository mocking.
- **Trade-off**: Requires boilerplate interface/implementation mapping even for simple CRUD operations.
