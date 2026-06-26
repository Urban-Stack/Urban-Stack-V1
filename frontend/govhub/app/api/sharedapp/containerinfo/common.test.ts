import {
  isError,
  isSuccess,
  mkError,
  mkSuccess,
} from '@/app/api/_common/containerinfo';

const info = {
  name: 'app',
  status: 'running',
  ready: true,
  logs: 'l1',
} as const;

describe('containerinfo helpers', () => {
  it('mkSuccess produces success and isSuccess detects it', () => {
    const resp = mkSuccess(info);
    expect(isSuccess(resp)).toBe(true);
    expect(isError(resp)).toBe(false);
    expect(resp.containerInfo).toEqual(info);
    expect(typeof resp.updatedAt).toBe('string');
  });

  it('mkError produces error and isError detects it', () => {
    const resp = mkError('oops');
    expect(isError(resp)).toBe(true);
    expect(isSuccess(resp)).toBe(false);
    expect(resp.error).toBe('oops');
  });
});
