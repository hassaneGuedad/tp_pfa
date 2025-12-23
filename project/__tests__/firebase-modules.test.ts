import { describe, it, expect, vi } from 'vitest';

// Mock Firebase modules to avoid real initialization
vi.mock('../lib/firebase-client', () => ({
  auth: null,
  db: null
}));

vi.mock('../lib/firebase-admin', () => ({
  adminAuth: null,
  adminDb: null
}));

describe('Firebase client and admin modules', () => {
  it('firebase-client exports exist', async () => {
    const fbClient = await import('../lib/firebase-client');
    expect(fbClient).toBeDefined();
  });

  it('firebase-admin exports exist', async () => {
    const fbAdmin = await import('../lib/firebase-admin');
    expect(fbAdmin).toBeDefined();
  });
});
