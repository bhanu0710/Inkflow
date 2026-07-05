import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { healthRouter } from "./health/index.js";
import { apiRouter } from "./routes/index.js";

import { swaggerUiServe, swaggerUiSetup } from "./lib/swagger/index.js";
import { requestLoggingMiddleware } from "./middlewares/request-logging.middleware.js";
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware.js";
import { metricsMiddleware } from "./middlewares/metrics.middleware.js";
import { registry } from "./lib/metrics/index.js";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.js";

export const createApp = () => {
  const app = express();

  // 1. Request Logging & Request ID (Correlation ID)
  app.use(requestLoggingMiddleware);

  // 2. Rate Limiting
  app.use(rateLimitMiddleware);

  // 3. Metrics Collection
  app.use(metricsMiddleware);

  // 4. Security headers
  app.use(helmet());
  app.use(cors({ origin: env.BACKEND_CORS_ORIGIN }));


  // 5. Compression
  app.use(compression());

  // 6. JSON Parser
  app.use(express.json());

  // 7. Routes
  app.get("/metrics", (req, res, next) => {
    res.setHeader("Content-Type", registry.contentType);
    registry.metrics()
      .then((data) => res.end(data))
      .catch(next);

  });
  app.use(healthRouter);
  app.use("/api/v1", apiRouter);
  app.use("/docs", ...swaggerUiServe, swaggerUiSetup);




  // 7. 404 Handler
  app.use(notFoundMiddleware);

  // 8. Global Error Handler
  app.use(errorMiddleware);

  return app;
};
