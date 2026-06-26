import { render } from '@testing-library/react';
import { internal } from './PublicSharedAppCard';
import { PublicSharedApp } from '@/app/_lib/resource-api/sharedapps/internal';
import { UdpCityToolCard } from 'udp-ui/components';
import {
  CITYTOOL_CATEGORY_LABELS,
  CITYTOOL_CATEGORY_ORDER,
} from '@/app/citytools/_internal/categories';

const { FormContent } = internal;

jest.mock('udp-ui/components', () => ({
  UdpCityToolCard: jest.fn(),
}));

const CATEGORIES = CITYTOOL_CATEGORY_ORDER.slice(1, 4);
const CAT_LABELS = CATEGORIES.map((cat) => CITYTOOL_CATEGORY_LABELS[cat]);

const sharedApp: PublicSharedApp = {
  name: 'test-app',
  displayName: 'Test App',
  description: 'A test shared app',
  pictureUri: 'https://path/to/picture.jpg',
  categories: CATEGORIES,
  adminContact: 'admin@test.com',
  url: 'https://test-app.example.com',
  tenant: 'guetersloh',
  tenantDisplayName: 'Gütersloh',
  _tag: 'PublicSharedApp',
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('FormContent', () => {
  it('calls UdpCityToolCard with correct props for running app', () => {
    render(
      <FormContent
        currentTenant={'other-tenant'}
        publicSharedApp={sharedApp}
      />,
    );

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test App',
        description: 'A test shared app',
        pictureUri: 'https://path/to/picture.jpg',
        categories: CAT_LABELS,
        href: 'https://test-app.example.com',
        target: '_blank',
        creator: 'public-shared-app',
        creatorTooltip: 'Von einer anderen Stadt erstellt',
        hideDeleteButton: true,
        hideInstallButton: true,
        contact: {
          prefixText: 'Ansprechpartner',
          mail: 'admin@test.com',
        },
      }),
      undefined,
    );
  });

  it('calls UdpCityToolCard with correct props for for app of same tenant', () => {
    render(
      <FormContent currentTenant={'guetersloh'} publicSharedApp={sharedApp} />,
    );

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test App',
        description: 'A test shared app',
        pictureUri: 'https://path/to/picture.jpg',
        categories: CAT_LABELS,
        href: 'https://test-app.example.com',
        target: '_blank',
        creator: 'my-shared-app',
        creatorTooltip: 'Von meiner Stadt erstellt',
        hideDeleteButton: true,
        hideInstallButton: true,
        contact: {
          prefixText: 'Ansprechpartner',
          mail: 'admin@test.com',
        },
      }),
      undefined,
    );
  });
});
