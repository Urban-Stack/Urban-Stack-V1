import AppDiscourseIframe from '@/app/_component/discourse/AppDiscourseIframe';
import { act, render, screen } from '@testing-library/react';
import { useDiscourse } from '@/app/_lib/discourse/discourse';
import { useSearchParams } from 'next/navigation';
import { FuncMock } from '@/app/_test/utils';
import { useIframeReset } from '@/app/_lib/client/iframeResetStorage';

const discourseBaseUrl = 'https://discourse.example.com';

const useDiscourseMock = useDiscourse as unknown as jest.Mock;
const useSearchParamsMock = useSearchParams as unknown as FuncMock<
  () => URLSearchParams
>;

jest.mock('@/app/_lib/discourse/discourse', () => ({
  useDiscourse: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

describe('AppDiscourseIframe', () => {
  const DISCOURSE_PATH = 'discourse-path';

  const useCurrentUser = jest.fn();

  beforeAll(() => {
    useDiscourseMock.mockReturnValue({
      useCurrentUser,
    });
  });

  beforeEach(() => {
    useCurrentUser.mockReset();
    useSearchParamsMock.mockReset();
  });

  it('renders Discourse iframe without path', () => {
    useCurrentUser.mockReturnValue({ isError: false });
    useSearchParamsMock.mockImplementationOnce(() => new URLSearchParams());

    const component = render(
      <AppDiscourseIframe discourseBaseUrl={discourseBaseUrl} />,
    );

    const iframe = component.getByTitle('discourse-iframe');

    expect(iframe).toHaveAttribute('src', discourseBaseUrl);
  });

  it('renders Discourse iframe with path', () => {
    useCurrentUser.mockReturnValue({
      isError: false,
    });
    useSearchParamsMock.mockImplementationOnce(
      () => new URLSearchParams([['path', DISCOURSE_PATH]]),
    );

    const component = render(
      <AppDiscourseIframe discourseBaseUrl={discourseBaseUrl} />,
    );

    const iframe = component.getByTitle('discourse-iframe');

    expect(iframe).toHaveAttribute(
      'src',
      `${discourseBaseUrl}/${DISCOURSE_PATH}`,
    );
  });

  it('renders spinner when not logged in', () => {
    useCurrentUser.mockReturnValue({ isError: true });
    useSearchParamsMock.mockImplementationOnce(() => new URLSearchParams());

    const component = render(
      <AppDiscourseIframe discourseBaseUrl={discourseBaseUrl} />,
    );

    const spinner = component.getByTestId('udp-spinner');

    expect(spinner).toBeInTheDocument();
  });

  describe('reset', () => {
    const refreshToken = (iframeId: string) => {
      const state = useIframeReset.getState();
      const nextToken = state.nextToken as (id: string) => void;
      act(() => nextToken(iframeId));
    };

    it('remounts iframe when Discourse token changes', () => {
      useCurrentUser.mockReturnValue({ isError: false });
      useSearchParamsMock.mockImplementation(() => new URLSearchParams());
      render(<AppDiscourseIframe discourseBaseUrl={discourseBaseUrl} />);

      const iframeBefore = screen.getByTitle('discourse-iframe');
      refreshToken('DISCOURSE');
      const iframeAfter = screen.getByTitle('discourse-iframe');

      expect(iframeBefore).not.toBe(iframeAfter);
    });

    it('does not remount iframe on change of other token', () => {
      useCurrentUser.mockReturnValue({ isError: false });
      useSearchParamsMock.mockImplementation(() => new URLSearchParams());
      render(<AppDiscourseIframe discourseBaseUrl={discourseBaseUrl} />);

      const iframeBefore = screen.getByTitle('discourse-iframe');
      refreshToken('OTHER_IFRAME');
      const iframeAfter = screen.getByTitle('discourse-iframe');

      expect(iframeBefore).toBe(iframeAfter);
    });
  });
});
