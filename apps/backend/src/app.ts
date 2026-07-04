import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { healthRouter } from "./health/index.js";
import { apiRouter } from "./routes/index.js";
import { httpLogger } from "./lib/logger/index.js";

import { swaggerUiServe, swaggerUiSetup } from "./lib/swagger/index.js";
import { requestContextMiddleware } from "./middlewares/request-context.middleware.js";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.js";

export const createApp = () => {
  const app = express();

  // 1. Security headers
  app.use(helmet());
  app.use(cors({ origin: env.BACKEND_CORS_ORIGIN }));

  // 2. Request ID correlation
  app.use(requestContextMiddleware);

  // 3. Compression
  app.use(compression());

  // 4. JSON Parser
  app.use(express.json());

  // 5. HTTP Logging
  app.use(httpLogger);

  // 6. Routes
  app.use(healthRouter);
  app.use("/api/v1", apiRouter);
  app.use("/docs", ...swaggerUiServe, swaggerUiSetup);


  // 7. 404 Handler
  app.use(notFoundMiddleware);

  // 8. Global Error Handler
  app.use(errorMiddleware);

  return app;
};
