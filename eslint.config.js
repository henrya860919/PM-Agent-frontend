import js from '@eslint/js';
import json from '@eslint/json';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginVue from 'eslint-plugin-vue';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['**/*.{ts,vue}'],
    plugins: {
      js,
      vue: pluginVue,
      '@typescript-eslint': tseslint,
      prettier: pluginPrettier,
    },
    extends: ['js/recommended'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // JS/TS/Vue/Prettier 的綜合推薦規則
      ...tseslint.configs.recommended.rules,
      ...pluginVue.configs['vue3-recommended'].rules,
      'prettier/prettier': 'warn',

      // 自訂規則
      'no-console': 'warn',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  { files: ['**/*.json'], plugins: { json }, language: 'json/json', extends: ['json/recommended'] },
  globalIgnores([
    'node_modules',
    'dist',
    'build',
    'coverage',
    'out',
    'temp',
    '.cache',
    '.next',
    '.nuxt',
    '.vercel',
    '.output',
    '.turbo',
    '.vscode-test',
  ]),
]);
