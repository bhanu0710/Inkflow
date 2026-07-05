import swaggerUi from "swagger-ui-express";
import { env } from "../../config/env.js";

/**
 * OpenAPI 3.0.3 Contract Specification for Inkflow.
 *
 * Responsibilities:
 * - Define schemas, request/response models, and auth security.
 * - Serve as the single source of truth for the API document contract.
 */
export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: env.SWAGGER_TITLE,
    version: env.SWAGGER_VERSION,
    description: "Production API documentation for Inkflow - a high-performance blogging application.",
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
    contact: {
      name: "Inkflow Team",
      email: "support@inkflow.example.com",
    },
  },
  tags: [
    {
      name: "Authentication",
      description: "Member registration, session creation, token refreshing, and profile updates.",
    },
    {
      name: "Posts",
      description: "Manage author posts, view drafts, publish content, and read public listings.",
    },
    {
      name: "Health",
      description: "Liveness and readiness probes for monitoring and platform container status.",
    },
  ],
  security: [],
  paths: {
    "/api/v1/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user account",
        description: "Creates a new user profile with email, username, and password.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Registration successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
                        email: { type: "string", format: "email", example: "jane.doe@example.com" },
                        username: { type: "string", example: "janedoe" },
                        displayName: { type: "string", example: "Jane Doe" },
                        createdAt: { type: "string", format: "date-time", example: "2026-07-05T20:22:36.000Z" },
                      },
                      required: ["id", "email", "username", "displayName", "createdAt"],
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
          "409": {
            $ref: "#/components/responses/ConflictError",
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in with email credentials",
        description: "Authenticates user and returns access/refresh tokens.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                        refreshToken: { type: "string", format: "uuid", example: "888e4567-e89b-12d3-a456-426614174888" },
                        user: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
                            email: { type: "string", format: "email", example: "jane.doe@example.com" },
                            username: { type: "string", example: "janedoe" },
                            displayName: { type: "string", example: "Jane Doe" },
                          },
                          required: ["id", "email", "username", "displayName"],
                        },
                      },
                      required: ["accessToken", "refreshToken", "user"],
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
          "401": {
            $ref: "#/components/responses/AuthenticationError",
          },
        },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh API Access Token",
        description: "Replaces expired Access Token using a valid Refresh Token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RefreshRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tokens successfully refreshed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                        refreshToken: { type: "string", format: "uuid", example: "888e4567-e89b-12d3-a456-426614174888" },
                      },
                      required: ["accessToken", "refreshToken"],
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
          "401": {
            $ref: "#/components/responses/AuthenticationError",
          },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out user session",
        description: "Revokes the active Refresh Token to log out the user.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RefreshRequest",
              },
            },
          },
        },
        responses: {
          "204": {
            description: "Successfully logged out",
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current user profile",
        description: "Returns the authenticated user's profile details.",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user profile fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/AuthenticationError",
          },
        },
      },
      patch: {
        tags: ["Authentication"],
        summary: "Update current user profile",
        description: "Updates profile fields such as username and display name.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateProfileRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
          "401": {
            $ref: "#/components/responses/AuthenticationError",
          },
          "409": {
            $ref: "#/components/responses/ConflictError",
          },
        },
      },
    },
    "/api/v1/posts": {
      post: {
        tags: ["Posts"],
        summary: "Create a new post",
        description: "Creates a post in DRAFT status with derived slug and reading time.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreatePostRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Post created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      $ref: "#/components/schemas/Post",
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
          "401": {
            $ref: "#/components/responses/AuthenticationError",
          },
        },
      },
      get: {
        tags: ["Posts"],
        summary: "List personal posts",
        description: "Returns paginated list of posts owned by the authenticated author.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Page number to retrieve",
            required: false,
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Number of items per page",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          "200": {
            description: "Author's paginated posts fetched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedPosts",
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
          "401": {
            $ref: "#/components/responses/AuthenticationError",
          },
        },
      },
    },
    "/api/v1/posts/{postId}": {
      get: {
        tags: ["Posts"],
        summary: "Get post by ID",
        description: "Returns full details of a specific post owned by the authenticated author.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "postId",
            in: "path",
            description: "UUID of the post",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Post fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      $ref: "#/components/schemas/Post",
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/AuthenticationError",
          },
          "404": {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
      patch: {
        tags: ["Posts"],
        summary: "Update draft post",
        description: "Updates an existing draft post title and content.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "postId",
            in: "path",
            description: "UUID of the post",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdatePostRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Draft post updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      $ref: "#/components/schemas/Post",
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
          "401": {
            $ref: "#/components/responses/AuthenticationError",
          },
          "404": {
            $ref: "#/components/responses/NotFoundError",
          },
          "409": {
            $ref: "#/components/responses/ConflictError",
          },
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Delete draft post",
        description: "Permanently deletes a draft post owned by the author.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "postId",
            in: "path",
            description: "UUID of the post",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "204": {
            description: "Draft post successfully deleted",
          },
          "401": {
            $ref: "#/components/responses/AuthenticationError",
          },
          "404": {
            $ref: "#/components/responses/NotFoundError",
          },
          "409": {
            $ref: "#/components/responses/ConflictError",
          },
        },
      },
    },
    "/api/v1/posts/{postId}/publish": {
      post: {
        tags: ["Posts"],
        summary: "Publish a draft post",
        description: "Publishes a draft post and assigns publishedAt timestamp.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "postId",
            in: "path",
            description: "UUID of the post",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Post published successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      $ref: "#/components/schemas/Post",
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/AuthenticationError",
          },
          "404": {
            $ref: "#/components/responses/NotFoundError",
          },
          "409": {
            $ref: "#/components/responses/ConflictError",
          },
        },
      },
    },
    "/api/v1/posts/public": {
      get: {
        tags: ["Posts"],
        summary: "List public published posts",
        description: "Returns paginated list of all published posts.",
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Page number to retrieve",
            required: false,
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Number of items per page",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          "200": {
            description: "Public published posts fetched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedPosts",
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
        },
      },
    },
    "/api/v1/posts/public/{slug}": {
      get: {
        tags: ["Posts"],
        summary: "Get public post by slug",
        description: "Retrieves a single published post details using its slug.",
        parameters: [
          {
            name: "slug",
            in: "path",
            description: "The unique slug of the post",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Public post fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      $ref: "#/components/schemas/Post",
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
          "404": {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Unified health check",
        description: "Checks PostgreSQL and Redis status and processes runtime information.",
        responses: {
          "200": {
            description: "Services are healthy",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse",
                },
              },
            },
          },
          "503": {
            description: "One or more core services are down",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse",
                },
              },
            },
          },
        },
      },
    },
    "/health/live": {
      get: {
        tags: ["Health"],
        summary: "Liveness probe",
        description: "Checks if application process container is alive.",
        responses: {
          "200": {
            description: "Container process is alive",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "UP" },
                  },
                  required: ["status"],
                },
              },
            },
          },
        },
      },
    },
    "/health/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness probe",
        description: "Checks PostgreSQL and Redis network connection status.",
        responses: {
          "200": {
            description: "All database connections are ready",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ReadinessResponse",
                },
              },
            },
          },
          "503": {
            description: "Dependencies failed connectivity tests",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ReadinessResponse",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Provide JWT Access Token format: Bearer <JWT>",
      },
    },
    responses: {
      ValidationError: {
        description: "Invalid request payload format",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ValidationError",
            },
          },
        },
      },
      AuthenticationError: {
        description: "Authentication failed or token is missing/expired",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AuthenticationError",
            },
          },
        },
      },
      ConflictError: {
        description: "Resource conflict, unique field constraint breached",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ConflictError",
            },
          },
        },
      },
      NotFoundError: {
        description: "Request path or requested resource id could not be found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NotFoundError",
            },
          },
        },
      },
      TooManyRequestsError: {
        description: "Rate limit exceeded, request blocked",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/TooManyRequestsError",
            },
          },
        },
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
          email: { type: "string", format: "email", example: "jane.doe@example.com" },
          username: { type: "string", example: "janedoe" },
          displayName: { type: "string", example: "Jane Doe" },
          createdAt: { type: "string", format: "date-time", example: "2026-07-05T20:22:36.000Z" },
          updatedAt: { type: "string", format: "date-time", example: "2026-07-05T20:22:36.000Z" },
        },
        required: ["id", "email", "username", "displayName", "createdAt", "updatedAt"],
      },
      Post: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "987e6543-e89b-12d3-a456-426614174099" },
          authorId: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
          title: { type: "string", example: "Getting Started with Antigravity" },
          slug: { type: "string", example: "getting-started-with-antigravity" },
          markdownContent: { type: "string", example: "# Getting Started\nThis is post content." },
          status: { type: "string", enum: ["DRAFT", "PUBLISHED"], example: "DRAFT" },
          readingTimeMinutes: { type: "integer", example: 1 },
          publishedAt: { type: "string", format: "date-time", nullable: true, example: null },
          createdAt: { type: "string", format: "date-time", example: "2026-07-05T20:22:36.000Z" },
          updatedAt: { type: "string", format: "date-time", example: "2026-07-05T20:22:36.000Z" },
        },
        required: ["id", "authorId", "title", "slug", "markdownContent", "status", "readingTimeMinutes", "createdAt", "updatedAt"],
      },
      PaginatedPosts: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Post",
            },
          },
          meta: {
            type: "object",
            properties: {
              nextCursor: { type: "string", nullable: true, example: null },
              previousCursor: { type: "string", nullable: true, example: null },
              hasNextPage: { type: "boolean", example: false },
              hasPreviousPage: { type: "boolean", example: false },
              totalCount: { type: "integer", example: 1 },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              totalPages: { type: "integer", example: 1 },
            },
            required: ["nextCursor", "previousCursor", "hasNextPage", "hasPreviousPage", "totalCount", "page", "limit", "totalPages"],
          },
        },
        required: ["success", "data", "meta"],
      },
      RegisterRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "jane.doe@example.com" },
          username: { type: "string", minLength: 3, maxLength: 50, example: "janedoe" },
          displayName: { type: "string", minLength: 1, maxLength: 100, example: "Jane Doe" },
          password: { type: "string", minLength: 8, maxLength: 100, example: "SecretPass123" },
        },
        required: ["email", "username", "displayName", "password"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "jane.doe@example.com" },
          password: { type: "string", example: "SecretPass123" },
        },
        required: ["email", "password"],
      },
      RefreshRequest: {
        type: "object",
        properties: {
          refreshToken: { type: "string", format: "uuid", example: "888e4567-e89b-12d3-a456-426614174888" },
        },
        required: ["refreshToken"],
      },
      UpdateProfileRequest: {
        type: "object",
        properties: {
          username: { type: "string", minLength: 3, maxLength: 50, example: "newjanedoe" },
          displayName: { type: "string", minLength: 1, maxLength: 100, example: "New Jane Name" },
        },
      },
      CreatePostRequest: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200, example: "My First Post Title" },
          markdownContent: { type: "string", minLength: 1, example: "Lots of awesome markdown text..." },
        },
        required: ["title", "markdownContent"],
      },
      UpdatePostRequest: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200, example: "Updated Post Title" },
          markdownContent: { type: "string", minLength: 1, example: "Updated markdown text content..." },
        },
        additionalProperties: false,
      },
      ValidationError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Validation failed" },
              requestId: { type: "string", format: "uuid", example: "d54d7ab2-d66a-49ca-9fa1-030a210086aa" },
              details: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    field: { type: "string", example: "email" },
                    message: { type: "string", example: "Invalid email" },
                  },
                  required: ["field", "message"],
                },
              },
            },
            required: ["code", "message", "requestId", "details"],
          },
        },
        required: ["success", "error"],
      },
      AuthenticationError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "UNAUTHENTICATED" },
              message: { type: "string", example: "Authentication required" },
              requestId: { type: "string", format: "uuid", example: "d54d7ab2-d66a-49ca-9fa1-030a210086aa" },
            },
            required: ["code", "message", "requestId"],
          },
        },
        required: ["success", "error"],
      },
      ConflictError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "RESOURCE_CONFLICT" },
              message: { type: "string", example: "User with duplicate fields: [username] already exists." },
              requestId: { type: "string", format: "uuid", example: "d54d7ab2-d66a-49ca-9fa1-030a210086aa" },
            },
            required: ["code", "message", "requestId"],
          },
        },
        required: ["success", "error"],
      },
      NotFoundError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "RESOURCE_NOT_FOUND" },
              message: { type: "string", example: "Resource not found" },
              requestId: { type: "string", format: "uuid", example: "d54d7ab2-d66a-49ca-9fa1-030a210086aa" },
            },
            required: ["code", "message", "requestId"],
          },
        },
        required: ["success", "error"],
      },
      TooManyRequestsError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "TOO_MANY_REQUESTS" },
              message: { type: "string", example: "Too many requests, please try again later." },
              requestId: { type: "string", format: "uuid", example: "d54d7ab2-d66a-49ca-9fa1-030a210086aa" },
            },
            required: ["code", "message", "requestId"],
          },
        },
        required: ["success", "error"],
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["UP", "DOWN"], example: "UP" },
          service: { type: "string", example: "inkflow-backend" },
          environment: { type: "string", example: "production" },
          uptime: { type: "number", example: 3600.42 },
          timestamp: { type: "string", format: "date-time", example: "2026-07-05T20:22:36.000Z" },
          checks: {
            type: "object",
            properties: {
              database: { type: "string", enum: ["UP", "DOWN"], example: "UP" },
              redis: { type: "string", enum: ["UP", "DOWN"], example: "UP" },
            },
            required: ["database", "redis"],
          },
        },
        required: ["status", "service", "environment", "uptime", "timestamp", "checks"],
      },
      ReadinessResponse: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["UP", "DOWN"], example: "UP" },
          checks: {
            type: "object",
            properties: {
              database: { type: "string", enum: ["UP", "DOWN"], example: "UP" },
              redis: { type: "string", enum: ["UP", "DOWN"], example: "UP" },
            },
            required: ["database", "redis"],
          },
        },
        required: ["status", "checks"],
      },
    },
  },
};

export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);
