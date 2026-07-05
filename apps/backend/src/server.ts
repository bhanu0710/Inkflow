import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger/index.js";
import { disconnectPrisma } from "./repositories/prisma.repository.js";

const app = createApp();
let isShuttingDown = false;

const server = app.listen(env.BACKEND_PORT, env.BACKEND_HOST, () => {
  logger.info(
    {
      host: env.BACKEND_HOST,
      port: env.BACKEND_PORT
    },
    "Backend server started"
  );
});

const closeHttpServer = async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

const shutdown = async (signal: NodeJS.Signals) => {
  if (isShuttingDown) {
    logger.warn({ signal }, "Shutdown already in progress");
    return;
  }

  isShuttingDown = true;
  logger.info({ signal }, "Shutdown signal received");

  const forcedShutdownTimer = setTimeout(() => {
    logger.fatal(
      {
        signal,
        timeoutMs: env.GRACEFUL_SHUTDOWN_TIMEOUT_MS
      },
      "Graceful shutdown timed out"
    );

    process.exit(1);
  }, env.GRACEFUL_SHUTDOWN_TIMEOUT_MS);

  forcedShutdownTimer.unref();

  try {
    logger.info("Stopping HTTP server");
    await closeHttpServer();
    logger.info("HTTP server stopped");

    logger.info("Disconnecting Prisma");
    try {
      await disconnectPrisma();
      logger.info("Prisma disconnected");
    } catch (dbError) {
      logger.error({ error: dbError }, "Prisma disconnect failed");
    }

    clearTimeout(forcedShutdownTimer);
    logger.info({ signal }, "Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    clearTimeout(forcedShutdownTimer);
    logger.error({ error, signal }, "Graceful shutdown failed");
    process.exit(1);
  }

};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
