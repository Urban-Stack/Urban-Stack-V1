import { render } from '@testing-library/react';
import SharedAppCard from './SharedAppCard';
import {
  SharedApp,
  SharedAppStatus,
} from '@/app/_lib/resource-api/sharedapps/internal';
import { UdpCityToolCard } from 'udp-ui/components';
import {
  CITYTOOL_CATEGORY_LABELS,
  CITYTOOL_CATEGORY_ORDER,
} from '@/app/citytools/_internal/categories';

jest.mock('udp-ui/components', () => ({
  UdpCityToolCard: jest.fn(() => null),
}));

jest.mock('@/app/citytools/_internal/sharedapps/DeleteBadge', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const CATEGORIES = CITYTOOL_CATEGORY_ORDER.slice(1, 4);
const CAT_LABELS = CATEGORIES.map((cat) => CITYTOOL_CATEGORY_LABELS[cat]);

const mkSharedApp = (
  status: 'running' | 'waiting' | 'unknown' = 'running',
): SharedApp => ({
  name: 'test-app',
  displayName: 'Test App',
  pictureUri: 'https://path/to/picture.jpg',
  categories: CATEGORIES,
  description: 'A test shared app',
  adminContact: 'admin@test.com',
  url: 'https://test-app.example.com',
  status,
  ready: true,
  _tag: 'SharedApp',
});

const TENANT = 'guetersloh';

afterEach(() => {
  jest.clearAllMocks();
});

describe('SharedAppCard', () => {
  it('calls UdpCityToolCard with correct props for running app', () => {
    const sharedApp = mkSharedApp('running');

    render(<SharedAppCard tenant={TENANT} sharedApp={sharedApp} />);

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test App',
        description: 'A test shared app',
        pictureUri: 'https://path/to/picture.jpg',
        categories: CAT_LABELS,
        href: 'https://test-app.example.com',
        target: '_blank',
        state: {
          type: 'installed',
          typeText: 'Installiert',
          render: expect.any(Function),
        },
        creator: 'my-shared-app',
        creatorTooltip: 'Von meiner Stadt erstellt',
        contact: {
          prefixText: 'Ansprechpartner',
          mail: 'admin@test.com',
        },
        editBadge: expect.objectContaining({
          href: '/citytools/shared-app/guetersloh/test-app',
          tooltipText: 'Shared App bearbeiten',
        }),
      }),
      undefined,
    );
  });

  it('calls UdpCityToolCard with correct props for waiting app', () => {
    const sharedApp = mkSharedApp('waiting');

    render(<SharedAppCard tenant={TENANT} sharedApp={sharedApp} />);

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test App',
        description: 'A test shared app',
        pictureUri: 'https://path/to/picture.jpg',
        categories: CAT_LABELS,
        href: 'https://test-app.example.com',
        target: '_blank',
        state: {
          type: 'warning',
          typeText: 'Warnung',
          render: expect.any(Function),
        },
        creator: 'my-shared-app',
        creatorTooltip: 'Von meiner Stadt erstellt',
        contact: {
          prefixText: 'Ansprechpartner',
          mail: 'admin@test.com',
        },
        editBadge: expect.objectContaining({
          href: '/citytools/shared-app/guetersloh/test-app',
          tooltipText: 'Shared App bearbeiten',
        }),
        actionSlot: expect.anything(),
        hideDeleteButton: undefined,
      }),
      undefined,
    );
  });

  it('calls UdpCityToolCard with correct props for unknown app', () => {
    const sharedApp = mkSharedApp('unknown');

    render(<SharedAppCard tenant={TENANT} sharedApp={sharedApp} />);

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test App',
        description: 'A test shared app',
        pictureUri: 'https://path/to/picture.jpg',
        categories: CAT_LABELS,
        href: 'https://test-app.example.com',
        target: '_blank',
        state: {
          type: 'warning',
          typeText: 'Warnung',
          render: expect.any(Function),
        },
        creator: 'my-shared-app',
        creatorTooltip: 'Von meiner Stadt erstellt',
        contact: {
          prefixText: 'Ansprechpartner',
          mail: 'admin@test.com',
        },
        editBadge: expect.objectContaining({
          href: '/citytools/shared-app/guetersloh/test-app',
          tooltipText: 'Shared App bearbeiten',
        }),
      }),
      undefined,
    );
  });
});

describe('permissions', () => {
  it('hides delete button when not admin', () => {
    const sharedApp = mkSharedApp('running');

    render(
      <SharedAppCard tenant={TENANT} sharedApp={sharedApp} hideAdminElems />,
    );

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        hideDeleteButton: true,
        actionSlot: undefined,
      }),
      undefined,
    );
  });

  it('hides edit badge when not admin', () => {
    const sharedApp = mkSharedApp('running');

    render(
      <SharedAppCard tenant={TENANT} sharedApp={sharedApp} hideAdminElems />,
    );

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        editBadge: undefined,
      }),
      undefined,
    );
  });

  it.each<SharedAppStatus>(['running', 'waiting'])(
    'renders plain badge for state when not admin',
    (status) => {
      const sharedApp = mkSharedApp(status);

      render(
        <SharedAppCard tenant={TENANT} sharedApp={sharedApp} hideAdminElems />,
      );

      expect(UdpCityToolCard).toHaveBeenCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({
            render: undefined,
          }),
        }),
        undefined,
      );
    },
  );
});
