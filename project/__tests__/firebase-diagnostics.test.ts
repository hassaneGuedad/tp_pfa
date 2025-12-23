import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We'll mock runFirebaseDiagnostics to avoid real Firebase calls
vi.mock('../lib/firebase-diagnostics', async () => {
  const actual = await vi.importActual('../lib/firebase-diagnostics');
  return {
    ...actual,
    runFirebaseDiagnostics: vi.fn().mockResolvedValue({
      isConnected: false,
      isAuthenticated: false,
      projectId: 'capgeminismartprojectbuilder',
      authDomain: 'capgeminismartprojectbuilder.firebaseapp.com'
    })
  };
});

import { logFirebaseDiagnostics } from '../lib/firebase-diagnostics';

describe('logFirebaseDiagnostics', () => {
  let groupSpy: any;
  let logSpy: any;
  let errorSpy: any;
  let groupEndSpy: any;

  beforeEach(() => {
    groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls console methods without throwing', async () => {
    // logFirebaseDiagnostics triggers runFirebaseDiagnostics internally
    await logFirebaseDiagnostics();
    expect(groupSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();
    expect(groupEndSpy).toHaveBeenCalled();
  });
});
