/**
 * @project AncestorTree
 * @file vitest.config.ts
 * @description Vitest configuration for all integration/E2E tests.
 * @version 2.0.0
 * @updated 2026-08-09
 */

import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

// Load root-level .env so SUPABASE_SERVICE_ROLE_KEY etc. are available in tests
// (override: false — local .env.local takes priority if present)
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: false });
dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: false });

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/app/api/**/*.ts', 'src/lib/**/*.ts'],
      exclude: ['src/**/__tests__/**'],
    },
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
