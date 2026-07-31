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
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // react-hook-form APIs skip React Compiler memoization by design.
      "react-hooks/incompatible-library": "off",
      "no-restricted-imports": [
        "error",
        {
          // Exact module names only (paths does not prefix-match children).
          paths: [
            {
              name: "@components",
              message:
                "Do not import from the root @components barrel. Use @components/{feature}.",
            },
            {
              name: "@/components",
              message:
                "Use @components/{feature} (2nd-level barrel). Do not use @/ prefix.",
            },
            {
              name: "@/hooks",
              message: "Import hooks from @hooks (flat barrel), not @/hooks.",
            },
            {
              name: "@/lib",
              message: "Import from @lib (flat barrel), not @/lib.",
            },
            {
              name: "@/types",
              message: "Import types from @types (flat barrel), not @/types.",
            },
            {
              name: "@/constants",
              message: "Import constants from @constants, not @/constants.",
            },
            {
              name: "@/schemas",
              message: "Import schemas from @schemas, not @/schemas.",
            },
          ],
          patterns: [
            {
              group: ["@/components/*", "@/components/*/*", "@/components/*/*/*"],
              message:
                "Use @components/{feature} (2nd-level barrel). Do not use @/ prefix or deep file paths.",
            },
            {
              group: ["@components/*/*", "@components/*/*/*"],
              message:
                "Import from @components/{feature} barrel only — not deep file paths.",
            },
            {
              group: ["@/hooks/*", "@hooks/*"],
              message:
                "Import hooks from @hooks (flat barrel), not deep paths or @/ prefix.",
            },
            {
              group: ["@/lib/*", "@lib/*"],
              message:
                "Import from @lib (flat barrel), not deep paths or @/ prefix.",
            },
            {
              group: ["@/types/*"],
              message:
                "Import types from @types (flat barrel), not @/ prefix or deep paths.",
            },
            {
              regex: "^@types/.+",
              message:
                "Import from @types barrel only — not @types/{file}.",
            },
            {
              group: ["@/constants/*", "@constants/*"],
              message:
                "Import constants from @constants (flat barrel), not deep paths.",
            },
            {
              group: ["@/schemas/*", "@schemas/*"],
              message:
                "Import schemas from @schemas (flat barrel), not deep paths.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
