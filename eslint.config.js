import js from "@eslint/js";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import ts from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      ".react-router/**/*",
      "build/**/*",
      "node_modules/**/*",
      "vite.config.ts",
      "vitest.config.ts",
      "react-router.config.ts",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  perfectionist.configs["recommended-natural"],
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": hooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "perfectionist/sort-objects": "off",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  eslintPluginPrettierRecommended,
);
