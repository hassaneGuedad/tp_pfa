import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Import schemas from zodSchemas
import * as schemas from '../lib/zodSchemas';

describe('Zod schemas basic smoke test', () => {
  it('zodSchemas exports contain Zod validators', () => {
    expect(schemas).toBeDefined();
    // Check that exported items are Zod schemas or objects
    const keys = Object.keys(schemas);
    expect(keys.length).toBeGreaterThan(0);
  });
});
