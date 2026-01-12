import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import command from "eslint-plugin-command/config";
import svelte from "eslint-plugin-svelte";
import { defineConfig } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";
import svelteConfig from "./svelte.config.js";

export default defineConfig(
  command(),
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  prettier,
  svelte.configs.prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
        svelteConfig,
      },
    },
    rules: {
      "svelte/no-at-html-tags": "off",
    },
  },
  {
    ignores: [
      "**/.svelte-kit",
      "**/.yarn",
      "**/build",
      "**/dist",
      "**/node_modules",
      "**/package",
      "**/src/paraglide",
    ],
  },
);
