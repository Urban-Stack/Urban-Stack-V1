import { useNotificationCount } from '@/app/_lib/discourse/iframe-communication/useNotificationCount';
import { fireEvent, renderHook } from '@testing-library/react';
import { NotificationCount } from '@/app/_lib/discourse/iframe-communication/message';
import { toString } from './useNotificationCount';

const DISCOURSE_BASE_URL = 'https://community.data-hub.local';

describe('useNotificationCount', () => {
  it('returns undefined if no message was send', () => {
    const { result } = renderHook(() =>
      useNotificationCount(DISCOURSE_BASE_URL),
    );
    expect(result.current).toEqual({});
  });

  it('returns undefined if origin does not match', () => {
    const { result } = renderHook(() =>
      useNotificationCount(DISCOURSE_BASE_URL),
    );
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: 'http://evil.hacker',
        data: NotificationCount({ chatUnread: 1, notificationUnread: 2 }),
      }),
    );
    expect(result.current).toEqual({});
  });

  it('returns undefined if data format is not recognized', () => {
    const { result } = renderHook(() =>
      useNotificationCount(DISCOURSE_BASE_URL),
    );
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: DISCOURSE_BASE_URL,
        data: { bla: 'keks' },
      }),
    );
    expect(result.current).toEqual({});
  });

  it('returns correct notification count when send as message', () => {
    const { result } = renderHook(() =>
      useNotificationCount(DISCOURSE_BASE_URL),
    );
    const expected = { chatUnread: '1', notificationUnread: '2' };
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: DISCOURSE_BASE_URL,
        data: NotificationCount(expected),
      }),
    );
    expect(result.current).toEqual(expected);
  });
});

describe('toString', () => {
  it('returns correct string representation if input is string', () => {
    expect(toString('bla')).toEqual('bla');
  });

  it('returns 99+ if total exceeds 99', () => {
    expect(toString(100)).toEqual('99+');
  });

  it('returns undefined if total is less than 1', () => {
    expect(toString(0)).toBeUndefined();
  });

  it('returns total otherwise', () => {
    expect(toString(99)).toEqual('99');
  });
});
