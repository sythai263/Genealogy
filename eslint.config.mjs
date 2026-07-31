import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // ESLint 10 removed context.getFilename(); eslint-plugin-react still uses it
    // for React version auto-detection. Pin the version to skip that path.
    // See: https://github.com/vercel/next.js/issues/89764
    settings: {
      react: {
        version: "19",
      },
    },
  },
  {
    // react-hook-form's watch/useFormState APIs are intentionally incompatible with
    // React Compiler memoization; the rule only reports that compilation is skipped.
    rules: {
      "react-hooks/incompatible-library": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
