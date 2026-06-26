import { create } from 'zustand';

export type IframeId = 'DISCOURSE';

type State = {
  tokens: Partial<Record<IframeId, number>>;
  nextToken: (page: IframeId) => void;
};

export const useIframeReset = create<State>((set) => ({
  tokens: {},
  nextToken: (iframeId) =>
    set((s) => ({
      tokens: { ...s.tokens, [iframeId]: (s.tokens[iframeId] ?? 0) + 1 },
    })),
}));
