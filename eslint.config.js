import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import command from "eslint-plugin-command/config";
import eslintPluginSvelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";
import svelteConfig from "./svelte.config.js";

export default ts.config(
  command(),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...eslintPluginSvelte.configs["flat/recommended"],
  eslintConfigPrettier,
  ...eslintPluginSvelte.configs["flat/prettier"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Add this if you are using SvelteKit in non-SPA mode
      },
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
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
