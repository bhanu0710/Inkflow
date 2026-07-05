import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

// Eagerly load environment variables from .env file for Vitest environment
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const parts = trimmed.split("=");
        const key = parts[0]?.trim();
        if (key) {
          const val = parts.slice(1).join("=").trim();
          const cleanVal = val.replace(/^["']|["']$/g, "");
          if (process.env[key] === undefined) {
            process.env[key] = cleanVal;
          }
        }
      }
    }
  }
} catch {
  // Silent fail in testing environment
}

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    pool: "forks",
  },
});
