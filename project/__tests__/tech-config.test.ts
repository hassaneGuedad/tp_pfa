import { it, describe, expect } from 'vitest';
import { TECH_CONFIG } from '../lib/tech-config';

describe('TECH_CONFIG basic shape', () => {
  it('contains expected keys and fields', () => {
    expect(TECH_CONFIG).toBeDefined();
    expect(TECH_CONFIG.react.name).toBe('React');
    expect(Array.isArray(TECH_CONFIG.react.dependencies)).toBe(true);
    expect(TECH_CONFIG.next).toBeDefined();
    expect(TECH_CONFIG.typescript.dependencies).toContain('typescript');
  });
});
