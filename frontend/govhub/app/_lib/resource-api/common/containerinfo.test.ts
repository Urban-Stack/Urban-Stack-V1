import {
  ContainerInfo,
  ContainerInfoQueryResult,
  getContainerStatus,
  mkContainerInfo,
  toContainerInfo,
} from './containerinfo';
import { ContainerStatus } from '@/app/__generated__/types';

describe('getContainerStatus', () => {
  it('returns running when running is true', () => {
    const status: Partial<ContainerStatus> = { running: true, waiting: false };
    expect(getContainerStatus(status as ContainerStatus)).toBe('running');
  });

  it('returns waiting when waiting is true', () => {
    const status: Partial<ContainerStatus> = { running: false, waiting: true };
    expect(getContainerStatus(status as ContainerStatus)).toBe('waiting');
  });

  it('returns unknown when neither running nor waiting', () => {
    const status: Partial<ContainerStatus> = { running: false, waiting: false };
    expect(getContainerStatus(status as ContainerStatus)).toBe('unknown');
  });

  it('returns unknown when status is undefined', () => {
    expect(getContainerStatus(undefined)).toBe('unknown');
  });
});

describe('mkContainerInfo', () => {
  it('returns the exact shape', () => {
    const info = mkContainerInfo(
      'app',
      'unknown',
      false,
      'logs',
      1,
      'reason',
      'message',
    );
    expect(info).toEqual({
      name: 'app',
      status: 'unknown',
      ready: false,
      logs: 'logs',
      restartCount: 1,
      waitingReason: 'reason',
      waitingMessage: 'message',
    });
  });
});

describe('toContainerInfo', () => {
  it('returns undefined when both sharedApp and dedicatedApp are absent', () => {
    expect(
      toContainerInfo({
        data: { __typename: 'Query' },
      } satisfies ContainerInfoQueryResult),
    ).toBeUndefined();
  });

  it('maps shared app data, normalizes CRLF, status running', () => {
    const result = {
      data: {
        sharedApp: {
          sharedApp: 'app1',
          containerLogs: 'line1\r\nline2\r\n',
          containerStatus: { running: true, waiting: false, ready: true },
        },
      },
    } satisfies ContainerInfoQueryResult;

    const info = toContainerInfo(result);
    expect(info).toMatchObject({
      name: 'app1',
      status: 'running',
      ready: true,
      logs: 'line1\nline2\n',
      restartCount: undefined,
      waitingReason: undefined,
      waitingMessage: undefined,
    });
  });

  it('maps dedicated app data, waiting status, and unescapes \\n and \"', () => {
    const result = {
      data: {
        dedicatedApp: {
          dedicatedApp: 'app2',
          containerLogs: 'a\\nb and \\\"q\\\"',
          containerStatus: {
            running: false,
            waiting: true,
            waitingMessage: 'wm',
            waitingReason: 'wr',
            ready: false,
            restartCount: 3,
          },
        },
      },
    };

    const info = toContainerInfo(result) as ContainerInfo;
    expect(info).toMatchObject({
      name: 'app2',
      status: 'waiting',
      ready: false,
      logs: 'a\nb and "q"',
      waitingMessage: 'wm',
      waitingReason: 'wr',
      restartCount: 3,
    });
  });
});
