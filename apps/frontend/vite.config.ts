import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      host: loadedEnv.FRONTEND_HOST,
      port: Number(loadedEnv.FRONTEND_PORT)
    },
    preview: {
      host: loadedEnv.FRONTEND_HOST,
      port: Number(loadedEnv.FRONTEND_PORT)
    }
  };
});
