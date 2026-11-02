import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

// Single source of truth for the public address: src/config.ts
const SITE_URL = /SITE_URL = "([^"]+)"/.exec(readFileSync("src/config.ts", "utf8"))![1];

export default defineConfig({
  plugins: [
    react(),
    { name: "site-url", transformIndexHtml: (html) => html.replaceAll("%SITE_URL%", SITE_URL) },
  ],
  build: { target: "es2020" },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
