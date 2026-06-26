import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Filter from '@/app/dashboards/Filter';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UdpFilterButton } from 'udp-ui/components';
import {
  internal,
  VizGroup,
} from '@/app/_lib/resource-api/viz-groups/vizGroups';

const MOCK_FAV_TOGGLE = 'mock-toggle-fav';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const MOCK_STATUS_BTN = 'mock-status-btn';
const MOCK_VIZGROUP_BTN = 'mock-vizgroup-btn';

jest.mock('udp-ui/components', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UdpToggleButton: jest.fn(({ checked, label, onChange }: any) => (
    <button
      data-testid={MOCK_FAV_TOGGLE}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
    >
      {label}
    </button>
  )),
  UdpFilterButton: jest.fn(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ options, onChange, label }: any) => {
      const testIds: Readonly<Record<string, string>> = {
        Status: MOCK_STATUS_BTN,
        'Dashboard-Gruppen': MOCK_VIZGROUP_BTN,
      };
      return (
        <button
          data-testid={testIds[label]}
          onClick={() =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange(options.map((o: any) => ({ ...o, checked: !o.checked })))
          }
        >
          {label}
        </button>
      );
    },
  ),
}));

const useRouterMock = useRouter as jest.Mock;
const usePathnameMock = usePathname as jest.Mock;
const useSearchParamsMock = useSearchParams as jest.Mock;

describe('Filter', () => {
  const replaceMock = jest.fn();
  const user = userEvent.setup();

  beforeAll(() => {
    useRouterMock.mockReturnValue({ replace: replaceMock });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    usePathnameMock.mockReturnValue('/dashboards');
  });

  describe('favorite filter', () => {
    it('shows toggle as checked when favorites=true is in URL', () => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams('favorites=true'),
      );

      const { getByTestId } = render(<Filter />);
      const toggle = getByTestId(MOCK_FAV_TOGGLE);

      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows toggle as unchecked when favorites param is missing', () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams());

      const { getByTestId } = render(<Filter />);
      const toggle = getByTestId(MOCK_FAV_TOGGLE);

      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows toggle as unchecked when favorites=unknown', () => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams('favorites=unknown'),
      );

      const { getByTestId } = render(<Filter />);
      const toggle = getByTestId(MOCK_FAV_TOGGLE);

      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('adds favorites=true to URL when toggled on', async () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams());

      const { getByTestId } = render(<Filter />);
      const toggle = getByTestId(MOCK_FAV_TOGGLE);

      await user.click(toggle);

      expect(replaceMock).toHaveBeenCalledWith('/dashboards?favorites=true');
    });

    it('removes favorites from URL when toggled off', async () => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams('favorites=true'),
      );

      const { getByTestId } = render(<Filter />);
      const toggle = getByTestId(MOCK_FAV_TOGGLE);

      await user.click(toggle);

      expect(replaceMock).toHaveBeenCalledWith('/dashboards?');
    });

    it('merges with other query params', async () => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams('view=list&search=test'),
      );

      const { getByTestId } = render(<Filter />);
      const toggle = getByTestId(MOCK_FAV_TOGGLE);

      await user.click(toggle);

      expect(replaceMock).toHaveBeenCalledWith(
        '/dashboards?view=list&search=test&favorites=true',
      );
    });
  });

  describe('status filter', () => {
    it.each([
      ['published', true],
      ['intern', false],
    ])(
      'calls status filter button component with correct options when %s',
      (statusStr, published) => {
        useSearchParamsMock.mockReturnValue(
          new URLSearchParams(`status=${statusStr}`),
        );

        render(<Filter />);

        expect(UdpFilterButton).toHaveBeenCalledWith(
          expect.objectContaining({
            label: 'Status',
            options: [
              { id: 'published', label: 'Veröffentlicht', checked: published },
              { id: 'intern', label: 'Intern', checked: !published },
            ],
            onChange: expect.any(Function),
          }),
          undefined,
        );
      },
    );

    it('adds status param when at least one option checked', async () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams());

      const { getByTestId } = render(<Filter />);
      const statusBtn = getByTestId(MOCK_STATUS_BTN);

      await userEvent.click(statusBtn);

      expect(replaceMock).toHaveBeenCalledWith(
        '/dashboards?status=published%2Cintern',
      );
    });
  });

  describe('vizgroup filter', () => {
    const vizGroups: VizGroup[] = [
      internal.mkVizGroup('vizgroup1', 'tenant1'),
      internal.mkVizGroup('vizgroup2', 'tenant2'),
    ];

    it.each([[], undefined])(
      'hides vizgroup filter button when no vizgroups',
      (vizGroups) => {
        useSearchParamsMock.mockReturnValue(new URLSearchParams());

        const { queryByTestId } = render(<Filter vizGroups={vizGroups} />);

        expect(queryByTestId(MOCK_VIZGROUP_BTN)).not.toBeInTheDocument();
      },
    );

    it('calls vizgroup filter button component with correct options', () => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams('vizgroups=tenant1_vizgroup1'),
      );

      render(<Filter vizGroups={vizGroups} />);

      expect(UdpFilterButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Dashboard-Gruppen',
          options: [
            {
              id: 'tenant1_vizgroup1',
              label: 'vizgroup1 (tenant1)',
              checked: true,
            },
            {
              id: 'tenant2_vizgroup2',
              label: 'vizgroup2 (tenant2)',
              checked: false,
            },
          ],
          onChange: expect.any(Function),
        }),
        undefined,
      );
    });

    it('adds vizgroups param when at least one option checked', async () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams());

      const { getByTestId } = render(<Filter vizGroups={vizGroups} />);
      const vizgroupBtn = getByTestId(MOCK_VIZGROUP_BTN);
      await userEvent.click(vizgroupBtn);

      expect(replaceMock).toHaveBeenCalledWith(
        '/dashboards?vizgroups=tenant1_vizgroup1%2Ctenant2_vizgroup2',
      );
    });
  });
});
