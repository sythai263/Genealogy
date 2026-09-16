/**
 * @project AncestorTree
 * @file vitest.config.ts
 * @description Vitest configuration for unit/integration tests.
 * @version 2.1.0
 * @updated 2026-08-09
 */

import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'vitest/config';

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
    alias: [
      { find: /^@components$/, replacement: path.resolve(__dirname, 'src/components') },
      { find: /^@components\//, replacement: path.resolve(__dirname, 'src/components') + '/' },
      { find: /^@constants$/, replacement: path.resolve(__dirname, 'src/constants') },
      { find: /^@constants\//, replacement: path.resolve(__dirname, 'src/constants') + '/' },
      { find: /^@contexts$/, replacement: path.resolve(__dirname, 'src/contexts') },
      { find: /^@contexts\//, replacement: path.resolve(__dirname, 'src/contexts') + '/' },
      { find: /^@data$/, replacement: path.resolve(__dirname, 'src/data') },
      { find: /^@data\//, replacement: path.resolve(__dirname, 'src/data') + '/' },
      { find: /^@hooks$/, replacement: path.resolve(__dirname, 'src/hooks') },
      { find: /^@hooks\//, replacement: path.resolve(__dirname, 'src/hooks') + '/' },
      { find: /^@lib$/, replacement: path.resolve(__dirname, 'src/lib') },
      { find: /^@lib\//, replacement: path.resolve(__dirname, 'src/lib') + '/' },
      { find: /^@schemas$/, replacement: path.resolve(__dirname, 'src/schemas') },
      { find: /^@schemas\//, replacement: path.resolve(__dirname, 'src/schemas') + '/' },
      { find: /^@services$/, replacement: path.resolve(__dirname, 'src/services') },
      { find: /^@services\//, replacement: path.resolve(__dirname, 'src/services') + '/' },
      { find: /^@types$/, replacement: path.resolve(__dirname, 'src/types') },
      { find: /^@types\//, replacement: path.resolve(__dirname, 'src/types') + '/' },
      { find: /^@messages$/, replacement: path.resolve(__dirname, 'src/messages') },
      { find: /^@messages\//, replacement: path.resolve(__dirname, 'src/messages') + '/' },
      { find: /^@i18n$/, replacement: path.resolve(__dirname, 'src/i18n') },
      { find: /^@i18n\//, replacement: path.resolve(__dirname, 'src/i18n') + '/' },
      { find: /^@\//, replacement: path.resolve(__dirname, 'src') + '/' },
    ],
  },
});
