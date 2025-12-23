import { describe, it, expect } from 'vitest';

describe('Utility config modules', () => {
  it('tailwind.config.ts exports exist', async () => {
    // We can't directly test config files in unit tests, but we can verify they parse
    const config = await import('../tailwind.config.ts');
    expect(config).toBeDefined();
  });

  it('next.config.cjs is valid', async () => {
    // next.config.cjs is a CommonJS file, but we can check if it exists and parses
    const config = await import('../next.config.cjs');
    expect(config).toBeDefined();
  });

  it('postcss.config.cjs is valid', async () => {
    const config = await import('../postcss.config.cjs');
    expect(config).toBeDefined();
  });
});
