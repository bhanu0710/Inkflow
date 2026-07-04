import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BACKEND_HOST: z.string().min(1),
  BACKEND_PORT: z.coerce.number().int().positive(),
  BACKEND_CORS_ORIGIN: z.string().min(1),
  SERVICE_NAME: z.string().min(1).default("inkflow-backend"),
  GRACEFUL_SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  SWAGGER_TITLE: z.string().min(1),
  SWAGGER_VERSION: z.string().min(1)
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
