import request from "supertest";
import { describe, it, expect } from "vitest";
import { createApp } from "../../src/app.js";
import { swaggerSpec } from "../../src/lib/swagger/index.js";

describe("OpenAPI / Swagger Integration Tests", () => {
  const app = createApp();

  it("should respond successfully at the /docs endpoint", async () => {
    // swagger-ui-express redirects /docs to /docs/ or serves HTML directly
    const response = await request(app).get("/docs");
    expect([200, 301, 302]).toContain(response.status);
  });

  it("should contain a valid OpenAPI specification structure", () => {
    expect(swaggerSpec.openapi).toBe("3.0.3");
    expect(swaggerSpec.info).toBeDefined();
    expect(swaggerSpec.info.title).toBeDefined();
    expect(swaggerSpec.info.version).toBeDefined();
    expect(swaggerSpec.paths).toBeDefined();
  });

  it("should declare BearerAuth security scheme in components", () => {
    const securitySchemes = swaggerSpec.components?.securitySchemes;
    expect(securitySchemes).toBeDefined();
    expect(securitySchemes?.BearerAuth).toBeDefined();
    expect(securitySchemes?.BearerAuth.type).toBe("http");
    expect(securitySchemes?.BearerAuth.scheme).toBe("bearer");
    expect(securitySchemes?.BearerAuth.bearerFormat).toBe("JWT");
  });

  it("should keep health endpoints public without requiring BearerAuth", () => {
    const healthPath = swaggerSpec.paths["/health"];
    const healthLivePath = swaggerSpec.paths["/health/live"];
    const healthReadyPath = swaggerSpec.paths["/health/ready"];

    expect(healthPath.get.security).toBeUndefined();
    expect(healthLivePath.get.security).toBeUndefined();
    expect(healthReadyPath.get.security).toBeUndefined();
  });

  it("should protect private auth and post endpoints with BearerAuth", () => {
    const getMePath = swaggerSpec.paths["/api/v1/auth/me"];
    const createPostPath = swaggerSpec.paths["/api/v1/posts"];

    expect(getMePath.get.security).toEqual([{ BearerAuth: [] }]);
    expect(createPostPath.post.security).toEqual([{ BearerAuth: [] }]);
  });
});
