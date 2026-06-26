import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  asyncElse,
  asyncNull,
  asyncOrElse,
  asyncOrRecover,
  tryElse,
  tryNull,
  tryOrElse,
  tryUndefined,
} from './try';

vi.mock('next/dist/client/components/redirect-error', () => ({
  isRedirectError: vi.fn(),
}));

const rethrow = vi.fn(() => true);
const error = new Error('error');

beforeEach(() => {
  rethrow.mockClear();
});

describe('tryOrElse', () => {
  it('returns result of f if f succeeds', () => {
    const actual = tryOrElse('default')(() => 2);

    expect(actual).toBe(2);
  });

  it('returns default value if f fails', () => {
    const actual = tryOrElse('default')(() => {
      throw error;
    });

    expect(actual).toBe('default');
  });

  it('rethrows error if rethrow is true', () => {
    expect(() =>
      tryOrElse('default')(() => {
        throw error;
      }, rethrow),
    ).toThrow(error);
    expect(rethrow).toHaveBeenCalledWith(error);
  });
});

describe('tryElse', () => {
  it('returns result of f if f succeeds', () => {
    const actual = tryElse(1)(() => 2);

    expect(actual).toBe(2);
  });

  it('returns default value if f fails', () => {
    const actual = tryElse(1)(() => {
      throw error;
    });

    expect(actual).toBe(1);
  });

  it('rethrows error if rethrow is true', () => {
    expect(() =>
      tryElse(1)(() => {
        throw error;
      }, rethrow),
    ).toThrow(error);
    expect(rethrow).toHaveBeenCalledWith(error);
  });
});

describe('tryNull', () => {
  it('returns result of f if f succeeds', () => {
    const actual = tryNull(() => 2);

    expect(actual).toBe(2);
  });

  it('returns null if f fails', () => {
    const actual = tryNull(() => {
      throw error;
    });

    expect(actual).toBe(null);
  });

  it('rethrows error if rethrow is true', () => {
    expect(() =>
      tryNull(() => {
        throw error;
      }, rethrow),
    ).toThrow(error);
    expect(rethrow).toHaveBeenCalledWith(error);
  });
});

describe('tryUndefined', () => {
  it('returns result of f if f succeeds', () => {
    const actual = tryUndefined(() => 2);

    expect(actual).toBe(2);
  });

  it('returns null if f fails', () => {
    const actual = tryUndefined(() => {
      throw error;
    });

    expect(actual).toBeUndefined();
  });

  it('rethrows error if rethrow is true', () => {
    expect(() =>
      tryUndefined(() => {
        throw error;
      }, rethrow),
    ).toThrow(error);
    expect(rethrow).toHaveBeenCalledWith(error);
  });
});

describe('asyncOrElse', () => {
  it('returns result of f if f succeeds', async () => {
    const actual = await asyncOrElse('default')(() => Promise.resolve(2));

    expect(actual).toBe(2);
  });

  it('returns default value if f fails', async () => {
    const actual = await asyncOrElse('default')(() =>
      Promise.reject(new Error('error')),
    );

    expect(actual).toBe('default');
  });

  it('re-throws error if predicate returns true', async () => {
    await expect(
      asyncOrElse('default')(() => Promise.reject(error), rethrow),
    ).rejects.toThrow(error);
    expect(rethrow).toHaveBeenCalledWith(error);
  });
});

describe('asyncElse', () => {
  it('returns result of f if f succeeds', async () => {
    const actual = await asyncElse(1)(() => Promise.resolve(2));

    expect(actual).toBe(2);
  });

  it('returns default value if f fails', async () => {
    const actual = await asyncElse(1)(() => Promise.reject(error));

    expect(actual).toBe(1);
  });

  it('re-throws error if predicate returns true', async () => {
    await expect(
      asyncElse(1)(() => Promise.reject(error), rethrow),
    ).rejects.toThrow(error);
    expect(rethrow).toHaveBeenCalledWith(error);
  });
});

describe('asyncNull', () => {
  it('returns result of f if f succeeds', async () => {
    const actual = await asyncNull(() => Promise.resolve(2));

    expect(actual).toBe(2);
  });

  it('returns null if f fails', async () => {
    const actual = await asyncNull(() => Promise.reject(error));

    expect(actual).toBe(null);
  });

  it('re-throws error if predicate returns true', async () => {
    await expect(
      asyncNull(() => Promise.reject(error), rethrow),
    ).rejects.toThrow(error);
    expect(rethrow).toHaveBeenCalledWith(error);
  });
});

describe('asyncOrRecover', () => {
  it('returns result of successFn if f succeeds', async () => {
    const TEST_VALUES = ['success0', 'success1'] as const;
    const TEST_IDX = 0;

    const onSuccess: (n: number) => string | undefined = (n) => TEST_VALUES[n];
    const f: (n: number) => () => Promise<number> = (n) => () =>
      Promise.resolve(n);

    const actual = await asyncOrRecover(() => 'error', onSuccess)(f(TEST_IDX));

    expect(actual).toBe(TEST_VALUES[TEST_IDX]);
  });

  it('returns result of errorFn if f fails', async () => {
    const MSG = 'custom error message';
    const f: () => Promise<number> = () => Promise.reject(new Error(MSG));
    const onError = (e: unknown) => (e instanceof Error ? e.message : 'error');

    const actual = await asyncOrRecover(onError, () => 'success')(f);

    expect(actual).toBe(MSG);
  });
});
