import { mkHref } from './util';

describe('mkHref', () => {
  it.each([
    ['tenant1', undefined, '/citytools/shared-app/tenant1/new'],
    ['tenant2', 'app42', '/citytools/shared-app/tenant2/app42'],
    ['abc', '', '/citytools/shared-app/abc/'],
  ])(
    'returns correct href for tenant=%s, sharedApp=%s',
    (tenant, sharedApp, expected) => {
      expect(mkHref(tenant, sharedApp)).toBe(expected);
    },
  );
});
