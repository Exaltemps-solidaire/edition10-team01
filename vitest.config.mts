import { configDefaults, defineConfig } from "vitest/config";

// Tests du service api/. Ceux du front tournent dans frontend/ (npm test les enchaîne).
export default defineConfig({
  test: {
    environment: "node",
    include: ["api/**/*.test.ts"],
    exclude: [...configDefaults.exclude, "e2e/**", "frontend/**"],
  },
});
