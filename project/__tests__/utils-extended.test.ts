import { describe, it, expect, vi } from 'vitest';
import { cn } from '../lib/utils';

// Mock fetch calls for utils that make API requests
global.fetch = vi.fn();

describe('utils.ts functions', () => {
  it('cn() merges Tailwind classes correctly', () => {
    const result = cn('px-2', 'px-4'); // px-4 should win
    expect(result).toContain('px-4');
  });

  it('cn() handles falsy values', () => {
    const result = cn('px-2', false, undefined, null, 'py-3');
    expect(result).toContain('px-2');
    expect(result).toContain('py-3');
  });

  it('cn() handles empty input', () => {
    const result = cn();
    expect(typeof result).toBe('string');
  });
});
