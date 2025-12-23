import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      all: false,
      exclude: [
        '**/*.d.ts',
        'node_modules/**',
        '.next/**',
        '**/scripts/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
      ],
      reportsDirectory: 'coverage',
    },
  },
})
