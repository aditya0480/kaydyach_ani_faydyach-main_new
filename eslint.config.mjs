import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";
import tailwindCanonical from "eslint-plugin-tailwind-canonical-classes";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tailwind.configs["flat/recommended"],
  {
    plugins: {
      "tailwind-canonical": tailwindCanonical,
      "unused-imports": unusedImports,
    },
    rules: {
      "tailwindcss/no-custom-classname": "off",
      "unused-imports/no-unused-imports": "error",
      "tailwind-canonical/tailwind-canonical-classes": [
        "error",
        {
          cssPath: path.join(__dirname, "app/globals.css"),
        },
      ],
      // Strict TypeScript rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    },
  },
  {
    settings: {
      tailwindcss: {
        config: path.join(__dirname, "app/globals.css"),
        callees: ["cn", "cva"],
        whitelist: [
          "^(bg|text|border|ring|outline|fill|stroke)-(background|foreground|card|popover|primary|secondary|muted|accent|destructive|input|border|ring)(/.*)?$",
          "^animate.*$",
          "^fade-in.*$",
          "^slide-in.*$",
          "^zoom-in.*$",
          "^scrollbar-hide$",
          "^date-picker.*$",
          "^(from|to|via)-(background|foreground|card|popover|primary|secondary|muted|accent|destructive|input|border|ring)(/.*)?$",
          "^search-.*$",
          "^pb-safe$",
          "^toaster$",
          "^toast$",
          "^description$",
          "^cancel$",
          "^origin-top-center$",
          "^prose-.*$",
          "^prose-headings:.*$",
          "^prose-p:.*$",
          "^prose-ul:.*$",
          "^prose-ol:.*$",
          "^prose-li:.*$",
          "^prose-blockquote:.*$",
          "^editor-.*$",
          "^input-otp-.*$",
          "^caret-blink$",
          "^has-fake-caret$",
        ],
      },
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cypress files use different conventions (CJS require, namespace declarations)
    "cypress.config.ts",
    "cypress/**",
  ]),
]);

export default eslintConfig;
