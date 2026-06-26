import React, { FormEvent } from 'react';
import { render } from '@testing-library/react';
import { DEBOUNCE_IN_MS } from '@/app/_component/searchbar/AppSearchBar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UdpSearchBar } from 'udp-ui/components';
import AppSearchBar from '@/app/_component/searchbar/AppSearchBar';

jest.mock('udp-ui/components', () => ({
  UdpSearchBar: jest.fn(() => <div data-testid='mock-search-bar' />),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const useRouterMock = useRouter as jest.Mock;
const usePathnameMock = usePathname as jest.Mock;
const useSearchParamsMock = useSearchParams as jest.Mock;
const replaceMock = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();

  useRouterMock.mockReturnValue({ replace: replaceMock });
  usePathnameMock.mockReturnValue('/dashboards');
  useSearchParamsMock.mockReturnValue(new URLSearchParams());
});

afterEach(() => {
  jest.useRealTimers();
});

it('matches snapshot', () => {
  const { container } = render(<AppSearchBar paramKey='search' />);
  expect(container).toMatchSnapshot();
});

it('sets defaultValue to the "search" param if present', () => {
  const searchValue = 'initialSearch';
  useSearchParamsMock.mockReturnValue(
    new URLSearchParams(`?search=${searchValue}`),
  );

  render(<AppSearchBar paramKey='search' />);

  expect(UdpSearchBar).toHaveBeenCalledWith(
    expect.objectContaining({
      defaultValue: searchValue,
    }),
    undefined,
  );
});

it('calls router.replace after user inputs text, respecting debounce', () => {
  useSearchParamsMock.mockReturnValue(new URLSearchParams('view=list'));

  render(<AppSearchBar paramKey='search' />);

  const lastCall = (UdpSearchBar as jest.Mock).mock.lastCall[0];
  const onInput = lastCall.onInput as (e: FormEvent<HTMLInputElement>) => void;
  const fakeEvent = {
    currentTarget: { value: 'newSearch' },
  } as unknown as FormEvent<HTMLInputElement>;

  onInput(fakeEvent);

  expect(replaceMock).not.toHaveBeenCalled();
  jest.advanceTimersByTime(DEBOUNCE_IN_MS);
  expect(replaceMock).toHaveBeenCalledWith(
    '/dashboards?view=list&search=newSearch',
  );
});

it('removes search param if user clears input', () => {
  useSearchParamsMock.mockReturnValue(
    new URLSearchParams('search=oldValue&view=list'),
  );

  render(<AppSearchBar paramKey='search' />);

  const lastCall = (UdpSearchBar as jest.Mock).mock.lastCall[0];
  const onInput = lastCall.onInput as (e: FormEvent<HTMLInputElement>) => void;
  const fakeEvent = {
    currentTarget: { value: '' },
  } as unknown as FormEvent<HTMLInputElement>;

  onInput(fakeEvent);

  expect(replaceMock).not.toHaveBeenCalled();
  jest.advanceTimersByTime(DEBOUNCE_IN_MS);
  expect(replaceMock).toHaveBeenCalledWith('/dashboards?view=list');
});

it('passes placeholder and disabled props to UdpSearchBar', () => {
  const { UdpSearchBar } = require('udp-ui/components');
  render(
    <AppSearchBar
      paramKey='search'
      placeholder='Suchbegriff eingeben'
      disabled
    />,
  );

  expect(UdpSearchBar).toHaveBeenCalledWith(
    expect.objectContaining({
      placeholder: 'Suchbegriff eingeben',
      disabled: true,
    }),
    undefined,
  );
});
