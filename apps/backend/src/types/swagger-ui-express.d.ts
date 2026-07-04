declare module "swagger-ui-express" {
  import type { RequestHandler } from "express";

  export interface SwaggerDocument {
    openapi: string;
    info: {
      title: string;
      version: string;
    };
    paths: Record<string, unknown>;
  }

  export const serve: RequestHandler[];
  export function setup(swaggerDoc: SwaggerDocument): RequestHandler;
}
