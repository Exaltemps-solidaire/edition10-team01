import { defineConfig, devices } from "@playwright/test";

// Démo du pitch (npm run demo), pas une suite de tests : un seul navigateur, le cas passant.
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
