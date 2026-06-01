import js from "@eslint/js";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import ts from "typescript-eslint";

export default ts.config(
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
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react,
      "react-hooks": hooks,
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. Side effect imports (e.g. css files)
            ["^\\u0000"],
            // 2. Node.js built-in modules
            ["^node:"],
            // 3. External npm packages (e.g. react, radix, etc.)
            ["^@?\\w"],
            // 4. Internal paths using the alias ~/
            ["^~"],
            // 5. Sibling and parent relative imports
            ["^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
