import { useDiscourse } from '@/app/_lib/discourse/discourse';
import { render } from '@testing-library/react';
import AppUserAvatar from '@/app/AppUserAvatar';
import { UdpAvatar } from 'udp-ui/components';
import { DiscourseUser } from '@/app/_lib/discourse/types';

const EXAMPLE_DISCOURSE_URL = 'http://discourse.data-hub.local';

const useDiscourseMock = useDiscourse as unknown as jest.Mock;

jest.mock('udp-ui/components');
jest.mock('@/app/_lib/discourse/discourse', () => ({
  ...jest.requireActual('@/app/_lib/discourse/discourse'),
  useDiscourse: jest.fn(),
}));

describe('AppUserAvatar', () => {
  const useCurrentUser = jest.fn();

  beforeAll(() => {
    useDiscourseMock.mockReturnValue({
      useCurrentUser,
    });
  });

  it('renders avatar with placeholder image while loading', () => {
    useCurrentUser.mockReturnValue({
      currentUser: undefined,
    });

    render(<AppUserAvatar discourseBaseUrl={EXAMPLE_DISCOURSE_URL} />);

    expect(useCurrentUser).toHaveBeenCalledWith();
    expect(UdpAvatar).toHaveBeenCalledWith(
      { img: undefined, alt: 'Benutzereinstellungen' },
      undefined,
    );
  });

  it('renders avatar with user image when loaded', () => {
    const currentUser: DiscourseUser = {
      id: 1,
      name: 'testuser',
      avatar_template: '/avatar/{size}/testuser.png',
      username: 'testuser',
    };

    useCurrentUser.mockReturnValue({
      currentUser,
    });

    render(<AppUserAvatar discourseBaseUrl={EXAMPLE_DISCOURSE_URL} />);

    expect(useCurrentUser).toHaveBeenCalledWith();
    expect(UdpAvatar).toHaveBeenCalledWith(
      {
        img: `${EXAMPLE_DISCOURSE_URL}/avatar/128/testuser.png`,
        alt: 'Benutzereinstellungen',
      },
      undefined,
    );
  });
});
