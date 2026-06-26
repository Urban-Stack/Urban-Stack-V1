const observeElement: <T>(
  retrieveVal: () => T,
  eq?: (v1: T, v2: T) => boolean,
) => (element: Element, onUpdate: (newVal: T) => void) => void =
  (retrieveVal, eq = (v1, v2) => v1 === v2) =>
  (element, onUpdate) => {
    let previous = retrieveVal();

    const observer = new MutationObserver(() => {
      const current = retrieveVal();
      if (!eq(previous, current)) {
        previous = current;
        onUpdate(current);
      }
    });

    observer.observe(element, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  };

const POLL_INTERVAL_MS = 250;
const MAX_TRIES = 50;

export const monitorElement: <M>(
  onUpdate: (msg?: M) => void,
  queryElement: () => Element | null,
  queryMsg: () => M,
  eqMsg?: (m1: M, m2: M) => boolean,
) => () => void = (onUpdate, queryElement, queryMsg, eqMsg) => () => {
  const registerObserver: (tries?: number) => void = (tries = 0) => {
    if (tries > MAX_TRIES) return;

    const element = queryElement();

    if (!element) {
      setTimeout(() => registerObserver(tries + 1), POLL_INTERVAL_MS);
      return;
    }

    observeElement(queryMsg, eqMsg)(element, onUpdate);

    onUpdate(queryMsg());
  };

  registerObserver();
};

export const waitForElement: (
  callback: () => void,
  queryElement: () => Element | null,
) => () => void = (callback, queryElement) => () => {
  const doWait: (tries?: number) => void = (tries = 0) => {
    if (tries > MAX_TRIES) return;

    const element = queryElement();
    if (!element) {
      setTimeout(() => doWait(tries + 1), POLL_INTERVAL_MS);
      return;
    }
    callback();
  };

  doWait();
};
