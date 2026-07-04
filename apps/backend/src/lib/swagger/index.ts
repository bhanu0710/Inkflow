import swaggerUi from "swagger-ui-express";

import { env } from "../../config/env.js";

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: env.SWAGGER_TITLE,
    version: env.SWAGGER_VERSION
  },
  paths: {}
};

export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);
