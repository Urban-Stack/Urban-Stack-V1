import { render } from '@testing-library/react';
import { internal } from './DedicatedAppCard';
import { DedicatedApp } from '@/app/_lib/resource-api/dedicatedapps';
import {
  FORM_NAMES,
  InstallModes,
} from '@/app/citytools/_internal/dedicatedapps/form';
import { UdpCityToolCard, UdpToast } from 'udp-ui/components';
import {
  CITYTOOL_CATEGORY_LABELS,
  CITYTOOL_CATEGORY_ORDER,
} from '@/app/citytools/_internal/categories';

jest.mock('@/app/citytools/_internal/dedicatedapps/actions', () => ({
  manageInstallation: jest.fn(),
}));

jest.mock('@/app/citytools/_internal/ContainerLogsModal', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

const { FormContent } = internal;

jest.mock('udp-ui/components', () => ({
  UdpToast: jest.fn(),
  UdpCityToolCard: jest.fn(() => null),
}));

const TEST_TENANT = 'guetersloh';
const CATEGORIES = CITYTOOL_CATEGORY_ORDER.slice(1, 4);
const CAT_LABELS = CATEGORIES.map((cat) => CITYTOOL_CATEGORY_LABELS[cat]);

const mkDedicatedApp = (isInstalled: boolean = false) =>
  ({
    name: 'dedicated',
    requestCityToolLink: '/new-topic?category=test',
    meta: {
      displayName: 'Dedicated App',
      description: 'Dedicated description',
      pictureUri: 'https://path/to/picture.jpg',
      categories: CATEGORIES,
    },
    url: 'https://dedicated.example.com',
    isInstalled,
    _tag: 'DedicatedApp',
  }) satisfies DedicatedApp;

const mockUdpToast = jest.mocked(UdpToast);

afterEach(() => {
  jest.clearAllMocks();
});

describe('FormContent', () => {
  it.each(InstallModes)('contains correct hidden form inputs', (mode) => {
    const dedicatedApp = mkDedicatedApp(mode === 'uninstall');
    const submit = jest.fn();

    const component = render(
      <FormContent
        tenant={TEST_TENANT}
        state={{ isInitial: true }}
        isLoading={false}
        submitForm={submit}
        dedicatedApp={dedicatedApp}
        hideAdminElems={false}
      />,
    );

    const getInput = (name: keyof typeof FORM_NAMES) =>
      component.container.querySelector(`input[name=${FORM_NAMES[name]}]`);

    expect(getInput('name')).toHaveValue(dedicatedApp.name);
    expect(getInput('mode')).toHaveValue(mode);
  });

  it('calls card component with correct props for admin (not installed)', () => {
    const dedicatedApp = mkDedicatedApp(false);
    const submit = jest.fn();

    render(
      <FormContent
        tenant={TEST_TENANT}
        state={{ isInitial: true }}
        isLoading={false}
        submitForm={submit}
        dedicatedApp={dedicatedApp}
        hideAdminElems={false}
      />,
    );

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: dedicatedApp.meta.displayName,
        description: dedicatedApp.meta.description,
        pictureUri: 'https://path/to/picture.jpg',
        categories: CAT_LABELS,
        href: 'https://dedicated.example.com',
        target: '_blank',
        isLoading: false,
        state: {
          type: 'installable',
          typeText: 'Installieren',
          onClick: expect.any(Function),
        },
        hideInstallButton: false,
        hideDeleteButton: false,
        removeBadge: undefined,
        creator: 'dedicated-app',
        creatorTooltip: 'Dedizierte App',
      }),
      undefined,
    );
  });

  it('calls card component with correct props when not admin', () => {
    const dedicatedApp = mkDedicatedApp(false);
    const submit = jest.fn();

    render(
      <FormContent
        tenant={TEST_TENANT}
        state={{ isInitial: true }}
        isLoading={false}
        submitForm={submit}
        dedicatedApp={dedicatedApp}
        hideAdminElems={true}
      />,
    );

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: dedicatedApp.meta.displayName,
        description: dedicatedApp.meta.description,
        pictureUri: 'https://path/to/picture.jpg',
        categories: CAT_LABELS,
        href: 'https://dedicated.example.com',
        target: '_blank',
        isLoading: false,
        state: {
          type: 'request',
          typeText: 'Zugriff anfordern',
          href: '/community?path=%2Fnew-topic%3Fcategory%3Dtest',
        },
        hideInstallButton: true,
        hideDeleteButton: true,
        removeBadge: undefined,
        creator: 'dedicated-app',
        creatorTooltip: 'Dedizierte App',
      }),
      undefined,
    );
  });

  it('passes render and removeBadge to card when installed as admin', () => {
    const dedicatedApp = mkDedicatedApp(true);
    const submit = jest.fn();

    render(
      <FormContent
        tenant={TEST_TENANT}
        state={{ isInitial: true }}
        isLoading={false}
        submitForm={submit}
        dedicatedApp={dedicatedApp}
        hideAdminElems={false}
      />,
    );

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        state: {
          type: 'installed',
          typeText: 'Installiert',
          render: expect.any(Function),
        },
        removeBadge: expect.objectContaining({
          tooltipText: 'City Tool deinstallieren',
          action: expect.any(Function),
        }),
      }),
      undefined,
    );
  });

  it('does not pass render to card when installed but not admin', () => {
    const dedicatedApp = mkDedicatedApp(true);
    const submit = jest.fn();

    render(
      <FormContent
        tenant={TEST_TENANT}
        state={{ isInitial: true }}
        isLoading={false}
        submitForm={submit}
        dedicatedApp={dedicatedApp}
        hideAdminElems={true}
      />,
    );

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        state: {
          type: 'installed',
          typeText: 'Installiert',
          render: undefined,
        },
      }),
      undefined,
    );
  });

  describe('toast', () => {
    const mockSuccess = jest.fn();
    const mockError = jest.fn();
    beforeAll(() => {
      mockUdpToast.mockImplementation((_, type) =>
        type === 'success' ? mockSuccess : mockError,
      );
    });

    it.each([
      [true, 'Citytool wurde installiert.'],
      [false, 'Citytool wurde deinstalliert.'],
    ])(
      'shows success toast on successful submission',
      async (isInstalled, msg) => {
        render(
          <FormContent
            tenant={TEST_TENANT}
            state={{ isInitial: false, data: {} }}
            isLoading={false}
            submitForm={jest.fn()}
            dedicatedApp={mkDedicatedApp(isInstalled)}
          />,
        );

        expect(mockSuccess).toHaveBeenCalled();
        expect(mockError).not.toHaveBeenCalled();
        expect(mockUdpToast).toHaveBeenCalledWith(msg, 'success');
      },
    );

    it.each([true, false])(
      'shows error toast when an error occurs',
      async (isInstalled) => {
        render(
          <FormContent
            tenant={TEST_TENANT}
            state={{ isInitial: false, errors: {} }}
            isLoading={false}
            submitForm={jest.fn()}
            dedicatedApp={mkDedicatedApp(isInstalled)}
          />,
        );

        expect(mockSuccess).not.toHaveBeenCalled();
        expect(mockError).toHaveBeenCalled();
        expect(mockUdpToast).toHaveBeenCalledWith(
          'Aktion konnte nicht durchgeführt werden.\n',
          'error',
        );
      },
    );
  });
});
