import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "build", "node_modules"]),

  {
    files: ["**/*.{js,jsx}"],

    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierConfig,
    ],

    plugins: {
      prettier: prettierPlugin,
    },

    languageOptions: {
      ecmaVersion: "latest",

      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      // "prettier/prettier": "warn",

      "no-unused-vars": "off",

      "no-console": "off",

      "no-debugger": "warn",

      "no-undef": "off",

      eqeqeq: ["error", "always"],

      "no-duplicate-imports": "error",
    },
  },
]);
