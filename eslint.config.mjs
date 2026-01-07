import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Allow valid setState patterns in effects (e.g., data fetching)
      "react-hooks/exhaustive-deps": "warn",
      // Disable overly strict rule that flags valid async data fetching patterns
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
