import { describe, expect, it } from "vitest";
import { router } from "./routes.ts";

describe("router", () => {
  it("répond 200 sur les deux routes de santé", async () => {
    expect((await router("GET", "/health")).statut).toBe(200);
    expect((await router("GET", "/sante?x=1")).statut).toBe(200);
  });

  it("répond 404 sur une route inconnue ou une méthode non prévue", async () => {
    expect((await router("GET", "/api/v1/inconnue")).statut).toBe(404);
    expect((await router("POST", "/health")).statut).toBe(404);
  });
});
