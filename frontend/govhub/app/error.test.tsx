import { useRouter } from 'next/navigation';
import { render } from '@testing-library/react';
import ErrorPage from '@/app/error';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

const useRouterMock = useRouter as unknown as jest.Mock;
const isRedirectErrorMock = isRedirectError as unknown as jest.Mock;
const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/dist/client/components/redirect-error', () => ({
  isRedirectError: jest.fn(),
}));

beforeAll(useRouterMock.mockReturnValue({ push }));

beforeEach(() => {
  push.mockReset();
  isRedirectErrorMock.mockReset();
});

it('redirect in case of redirect error', () => {
  isRedirectErrorMock.mockReturnValue(true);

  render(
    <ErrorPage error={new Error("I'm a a redirect error")} reset={() => {}} />,
  );

  expect(push).toHaveBeenCalledWith('/api/auth/signin');
});

it('returns fallback component in case of any other error', () => {
  isRedirectErrorMock.mockReturnValue(false);

  const component = render(
    <ErrorPage
      error={new Error("I'm NOT a redirect error")}
      reset={() => {}}
    />,
  );

  expect(
    component.getByText('Ein unerwarteter Fehler trat auf.'),
  ).toBeVisible();
});
