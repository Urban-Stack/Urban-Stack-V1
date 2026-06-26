import React from 'react';
import { render } from '@testing-library/react';
import ViewSelector from '@/app/dashboards/ViewSelector';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UdpButtonGroup, UdpButtonGroupDataArray } from 'udp-ui/components';
import { DEFAULT_VIEW, ViewType } from '@/app/dashboards/_internal/common';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpButtonGroup: jest.fn(() => <div data-testid='mock-button-group' />),
}));

const usePathnameMock = usePathname as jest.Mock;
const useRouterMock = useRouter as jest.Mock;
const useSearchParamsMock = useSearchParams as jest.Mock;
const UdpButtonGroupMock = UdpButtonGroup as jest.Mock;
const replaceMock = jest.fn();

describe('ViewSelector', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    usePathnameMock.mockReturnValue('/current-path');
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    useRouterMock.mockReturnValue({ replace: replaceMock });
  });

  it('matches snapshot', () => {
    const { container } = render(<ViewSelector />);
    expect(container).toMatchSnapshot();
  });

  it('defaults to the "card" view if no query param is set', () => {
    render(<ViewSelector />);

    expect(UdpButtonGroupMock).toHaveBeenCalledWith(
      expect.objectContaining({
        indexSelected: DEFAULT_VIEW,
      }),
      undefined,
    );
  });

  it.each(['list', 'card'])('reads %s selector from search params', (view) => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams(`?view=${view}`));

    render(<ViewSelector />);

    expect(UdpButtonGroupMock).toHaveBeenCalledWith(
      expect.objectContaining({
        indexSelected: ViewType[view as keyof typeof ViewType],
      }),
      undefined,
    );
  });

  it('updates search params', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('view=list'));

    render(<ViewSelector />);

    const lastCall = (UdpButtonGroup as jest.Mock).mock.lastCall[0];
    const selectCard = (lastCall.buttonsData as UdpButtonGroupDataArray)
      .array[1].onSelect;

    selectCard();

    expect(replaceMock).toHaveBeenCalledWith('/current-path?view=card');
  });
});
