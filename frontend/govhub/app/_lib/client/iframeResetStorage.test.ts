import { useIframeReset } from '@/app/_lib/client/iframeResetStorage';

describe('useIframeReset', () => {
  beforeEach(() => {
    useIframeReset.setState({ tokens: {} });
  });

  it('initially storage has no tokens', () => {
    const state = useIframeReset.getState();

    expect(state.tokens).toEqual({});
  });

  it('first call of nextToken creates new token entry for given ID with value 1', () => {
    const state = useIframeReset.getState();

    const nextToken = state.nextToken as (id: string) => void;
    nextToken('TEST_ID');

    expect(useIframeReset.getState().tokens).toEqual({ TEST_ID: 1 });
  });

  it('each call of nextToken increments the token value for the given ID', () => {
    const state = useIframeReset.getState();

    const nextToken = state.nextToken as (id: string) => void;
    nextToken('TEST_ID');
    nextToken('TEST_ID');
    nextToken('TEST_ID');

    expect(useIframeReset.getState().tokens).toEqual({ TEST_ID: 3 });
  });

  it('nextToken addresses IDs correctly', () => {
    const state = useIframeReset.getState();

    const nextToken = state.nextToken as (id: string) => void;
    nextToken('TEST_ID_A');
    nextToken('TEST_ID_B');
    nextToken('TEST_ID_B');
    nextToken('TEST_ID_A');
    nextToken('TEST_ID_A');

    expect(useIframeReset.getState().tokens).toEqual({
      TEST_ID_A: 3,
      TEST_ID_B: 2,
    });
  });
});
