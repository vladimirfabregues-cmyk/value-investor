import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // Next's tsconfig keeps JSX as-is for its own compiler; tests compile it here.
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
