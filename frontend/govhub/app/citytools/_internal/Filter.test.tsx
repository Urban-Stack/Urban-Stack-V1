import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Filter from './Filter';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UdpFilterButton } from 'udp-ui/components';

const MOCK_STATUS_BTN = 'mock-filter-btn-Status';
const MOCK_CATEGORY_BTN = 'mock-filter-btn-Kategorie';
const MOCK_MY_CITY_TOGGLE = 'mock-my-city-toggle';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  __esModule: true,
  UdpFilterButton: jest.fn(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ options, onChange, label }: any) => (
      <button
        data-testid={`mock-filter-btn-${label}`}
        onClick={() =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange(options.map((o: any) => ({ ...o, checked: !o.checked })))
        }
      >
        {label}
      </button>
    ),
  ),
  UdpToggleButton: jest.fn(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ checked, onChange, children }: any) => (
      <button
        data-testid={MOCK_MY_CITY_TOGGLE}
        onClick={() => onChange(!checked)}
      >
        {children}
      </button>
    ),
  ),
}));

const useRouterMock = useRouter as jest.Mock;
const usePathnameMock = usePathname as jest.Mock;
const useSearchParamsMock = useSearchParams as jest.Mock;

describe('Filter', () => {
  const user = userEvent.setup();
  const replaceMock = jest.fn();

  beforeAll(() => {
    useRouterMock.mockReturnValue({ replace: replaceMock });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    usePathnameMock.mockReturnValue('/citytools');
  });

  it('shows all filters when shared app admin', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams(''));
    const { getByTestId } = render(<Filter isSAAdmin />);

    expect(getByTestId(MOCK_STATUS_BTN)).toBeVisible();
    expect(getByTestId(MOCK_CATEGORY_BTN)).toBeVisible();
    expect(getByTestId(MOCK_MY_CITY_TOGGLE)).toBeVisible();
  });

  it('shows category and my city filters and hides status filter when not shared app admin', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams(''));
    const { queryByTestId, getByTestId } = render(<Filter isSAAdmin={false} />);

    expect(queryByTestId(MOCK_STATUS_BTN)).not.toBeInTheDocument();
    expect(getByTestId(MOCK_CATEGORY_BTN)).toBeVisible();
    expect(getByTestId(MOCK_MY_CITY_TOGGLE)).toBeVisible();
  });

  it.each([
    ['installed', true],
    ['not-installed', false],
  ])(
    'calls filter button with correct options when %s is set',
    (statusStr, installedChecked) => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams(`status=${statusStr}`),
      );

      render(<Filter isSAAdmin />);

      expect(UdpFilterButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Status',
          options: [
            {
              id: 'installed',
              label: 'Installiert',
              checked: installedChecked,
            },
            {
              id: 'not-installed',
              label: 'Verfügbar zur Installation',
              checked: !installedChecked,
            },
          ],
          onChange: expect.any(Function),
          placement: 'bottom-start',
        }),
        undefined,
      );
    },
  );

  it.each([
    [['Office', 'Geoinformation'], ['Datenanalyse']],
    [['Geoinformation'], ['Datenanalyse', 'Office']],
    [[], ['Geoinformation', 'Datenanalyse', 'Office']],
  ])(
    'calls categories filter button with correct options when %s is set',
    (categoriesChecked, categoriesNotChecked) => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams(`categories=${categoriesChecked.join(',')}`),
      );

      const checked = categoriesChecked.map((c) => ({
        id: c,
        label: c,
        checked: true,
      }));
      const notChecked = categoriesNotChecked.map((c) => ({
        id: c,
        label: c,
        checked: false,
      }));

      render(<Filter isSAAdmin />);

      expect(UdpFilterButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Kategorie',
          options: expect.arrayContaining([...checked, ...notChecked]),
          onChange: expect.any(Function),
          placement: 'bottom-start',
        }),
        undefined,
      );
    },
  );

  it('adds status param when options are checked', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());

    const { getByTestId } = render(<Filter isSAAdmin />);
    const btn = getByTestId(MOCK_STATUS_BTN);

    await user.click(btn);

    expect(replaceMock).toHaveBeenCalledWith(
      '/citytools?status=installed%2Cnot-installed',
    );
  });

  it('removes status param when no options checked', async () => {
    // Pre-check both options, then clicking will uncheck both
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams('status=installed,not-installed'),
    );

    const { getByTestId } = render(<Filter isSAAdmin />);
    const btn = getByTestId(MOCK_STATUS_BTN);

    await user.click(btn);

    expect(replaceMock).toHaveBeenCalledWith('/citytools?');
  });

  it('preserves other query parameters', async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams('view=grid&search=abc'),
    );

    const { getByTestId } = render(<Filter isSAAdmin />);
    const btn = getByTestId(MOCK_STATUS_BTN);

    await user.click(btn);

    expect(replaceMock).toHaveBeenCalledWith(
      '/citytools?view=grid&search=abc&status=installed%2Cnot-installed',
    );
  });
});
