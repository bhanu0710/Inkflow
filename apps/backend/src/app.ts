import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { healthRouter } from "./health/index.js";
import { httpLogger } from "./lib/logger/index.js";
import { swaggerUiServe, swaggerUiSetup } from "./lib/swagger/index.js";
import { requestContextMiddleware } from "./middlewares/request-context.middleware.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.BACKEND_CORS_ORIGIN }));
  app.use(express.json());
  app.use(compression());
  app.use(requestContextMiddleware);
  app.use(httpLogger);

  app.use(healthRouter);
  app.use("/docs", ...swaggerUiServe, swaggerUiSetup);

  return app;
};
