import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const projectRoot = fileURLToPath(new URL("..", import.meta.url));
  const backendRoot = fileURLToPath(new URL("../backend", import.meta.url));
  const { PORT = "3000" } = loadEnv(mode, backendRoot, "PORT");
  const backend = `http://localhost:${PORT}`;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": backend,
        "/uploads": backend,
      },
    },
  };
});
