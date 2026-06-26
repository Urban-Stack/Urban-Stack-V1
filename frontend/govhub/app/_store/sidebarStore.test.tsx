import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useSidebarStore } from '@/app/_store/sidebarStore';
import React from 'react';
import { render } from '@testing-library/react';
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from '@/app/_lib/client/localStorage';

describe('sidebarStore', () => {
  beforeEach(() => {
    removeLocalStorage('UGH_SIDEBAR_OPEN');
  });

  it('defaults isOpen to false', () => {
    const { isOpen } = useSidebarStore.getState();
    expect(isOpen).toBe(false);
  });

  it.each([
    [true, 'true'],
    [false, 'false'],
    [false, 'garbage'],
  ])(
    'initialises isOpen to %s correctly if local storage key UGH_SIDEBAR_OPEN is %s',
    (expected, value) => {
      setLocalStorage('UGH_SIDEBAR_OPEN', value);
      useSidebarStore.getState().init();
      const { isOpen } = useSidebarStore.getState();
      expect(isOpen).toBe(expected);
    },
  );

  it('initializes isOpen to false if local storage key UGH_SIDEBAR_OPEN is not set', () => {
    useSidebarStore.getState().init();
    const { isOpen } = useSidebarStore.getState();
    expect(isOpen).toBe(false);
  });

  it('updates local storage key UGH_SIDEBAR_OPEN when toggle is called', () => {
    useSidebarStore.getState().toggle();
    expect(getLocalStorage('UGH_SIDEBAR_OPEN')).toBe('true');
    useSidebarStore.getState().toggle();
    expect(getLocalStorage('UGH_SIDEBAR_OPEN')).toBe('false');
  });

  it('updates isOpen when toggle is called', async () => {
    const Toggle: React.FC = () => {
      const { toggle, isOpen } = useSidebarStore();
      return (
        <>
          <div>isOpen: {JSON.stringify(isOpen)}</div>
          <button onClick={toggle}>toggle</button>
        </>
      );
    };

    const { findByText, findByRole } = render(<Toggle />);
    expect(await findByText('isOpen: false')).toBeVisible();
    await userEvent.click(await findByRole('button', { name: 'toggle' }));
    expect(await findByText('isOpen: true')).toBeVisible();
  });
});
