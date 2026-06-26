import { fireEvent, renderHook } from '@testing-library/react';
import { useSqlQuery } from './useSqlQuery';
import { internal } from '@/app/_lib/superset/iframe-communication/message';

const SUPERSET_BASE_URL = 'https://superset.data-hub.local';

describe('useSqlQuery', () => {
  const sqlQuery = 'SELECT * FROM table';

  it('does nothing if origin is not correct', () => {
    const { result } = renderHook(() => useSqlQuery(SUPERSET_BASE_URL));
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: 'https://wrong-origin.local',
        data: internal.SqlQuery(sqlQuery),
      }),
    );
    expect(result.current).toEqual({ sqlQuery: undefined });
  });

  it('sets query on correct event', () => {
    const { result } = renderHook(() => useSqlQuery(SUPERSET_BASE_URL));
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: SUPERSET_BASE_URL,
        data: internal.SqlQuery(sqlQuery),
      }),
    );
    expect(result.current).toEqual({
      sqlQuery,
    });
  });

  it('does nothing on any other event', () => {
    const { result } = renderHook(() => useSqlQuery(SUPERSET_BASE_URL));
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: SUPERSET_BASE_URL,
        data: { sql: sqlQuery, _tag: 'AnyOtherEvent' },
      }),
    );
    expect(result.current).toEqual({ sqlQuery: undefined });
  });
});
