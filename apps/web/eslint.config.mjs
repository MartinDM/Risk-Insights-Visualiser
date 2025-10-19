// @ts-check

import { nextJsConfig } from '@workspace/eslint-config/next-js';

export default [
  {
    ignores: [
      // Build directories - must be at the top level
      '.next',
      '.next/**/*',
      '.turbo',
      '.turbo/**/*',
      'out',
      'out/**/*',
      'build',
      'build/**/*',
      'dist',
      'dist/**/*',

      // Dependencies
      'node_modules',
      'node_modules/**/*',

      // Config files that don't need linting
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      'postcss.config.mjs',
      'next.config.mjs',

      // Generated files
      'next-env.d.ts',

      // Cache directories
      '.eslintcache',
      '.stylelintcache',
    ],
  },
  ...(Array.isArray(nextJsConfig) ? nextJsConfig : [nextJsConfig]),
  {
    // Override or add additional rules specific to this app
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      'no-console': 'off', // Allow all console statements
      // Add any app-specific rules here
    },
  },
];
