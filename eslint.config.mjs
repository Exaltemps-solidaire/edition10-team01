import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// Lint du service api/ et des outils de la racine. frontend/ a sa propre configuration (Next.js).
export default defineConfig([
  ...tseslint.configs.recommended,
  globalIgnores(["frontend/**"]),
]);
