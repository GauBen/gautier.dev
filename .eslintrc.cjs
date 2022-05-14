module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['svelte3', '@typescript-eslint'],
  ignorePatterns: ['**/build/', '*.cjs'],
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  settings: { 'svelte3/typescript': () => require('typescript') },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
    extraFileExtensions: ['.svelte'],
  },
  rules: {
    curly: ['error', 'multi-or-nest', 'consistent'],
    'no-undef': 'off',
  },
}
