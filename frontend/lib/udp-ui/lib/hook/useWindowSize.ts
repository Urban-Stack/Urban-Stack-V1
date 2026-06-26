import { useSyncExternalStore } from 'react';

type WindowSize = {
  width: number;
};

const subscribe = (callback: () => void) => {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
};

const useWindowSize: (initialWidth?: number) => WindowSize = (
  initialWidth = 0,
) => {
  const width = useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => initialWidth,
  );
  return { width };
};

export default useWindowSize;
