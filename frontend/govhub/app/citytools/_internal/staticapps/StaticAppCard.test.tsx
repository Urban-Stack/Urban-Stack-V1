import { render } from '@testing-library/react';
import { internal } from './StaticAppCard';
import { internal as internalTools } from '@/app/_lib/resource-api/staticapps/internal';
import { mkStaticApp } from '@/app/_lib/resource-api/staticapps';
import {
  FORM_NAMES,
  InstallModes,
} from '@/app/citytools/_internal/staticapps/form';
import { UdpCityToolCard, UdpToast } from 'udp-ui/components';
import {
  CITYTOOL_CATEGORY_LABELS,
  CITYTOOL_CATEGORY_ORDER,
} from '@/app/citytools/_internal/categories';

const { FormContent } = internal;

const CITYTOOL_REQUEST_LINK = '/new-topic?category=test';
const EXPECTED_REQUEST_LINK = '/community?path=%2Fnew-topic%3Fcategory%3Dtest';
const STATICAPP_BASE_URL = 'https://citytools.urbanstack.de';
const TENANT = 'guetersloh';
const CATEGORIES = CITYTOOL_CATEGORY_ORDER.slice(1, 4);
const CAT_LABELS = CATEGORIES.map((cat) => CITYTOOL_CATEGORY_LABELS[cat]);

jest.mock('@/app/citytools/_internal/staticapps/actions', () => ({
  installCityTool: jest.fn(),
}));
jest.mock('udp-ui/components', () => ({
  UdpToast: jest.fn(),
  UdpCityToolCard: jest.fn(),
}));

const mockUdpToast = UdpToast as unknown as jest.Mock;

const mkTool = (
  isInstalled: boolean = false,
  path?: string,
  indexPath?: string,
) =>
  mkStaticApp(
    internalTools.mkStaticAppInfo('weather', CITYTOOL_REQUEST_LINK, {
      displayName: 'Weather',
      description: 'Shows weather',
      pictureUri: 'https://path/to/picture.jpg',
      categories: CATEGORIES,
      showInCitizenHub: true,
      showInGovHub: true,
      indexPath,
    }),
    isInstalled,
    TENANT,
    path,
  );

afterEach(() => {
  jest.clearAllMocks();
});

describe('FormContent', () => {
  it.each(InstallModes)('contains correct hidden form inputs', (mode) => {
    const staticApp = mkTool(mode === 'uninstall');
    const submit = jest.fn();

    const component = render(
      <FormContent
        tenant='knuffigen'
        state={{ isInitial: true }}
        isLoading={false}
        isCityToolAdmin
        submitForm={submit}
        staticApp={staticApp}
        staticAppBaseUrl={STATICAPP_BASE_URL}
      />,
    );

    const getInput = (name: keyof typeof FORM_NAMES) =>
      component.container.querySelector(`input[name=${FORM_NAMES[name]}]`);

    expect(getInput('name')).toHaveValue(staticApp.name);
    expect(getInput('mode')).toHaveValue(mode);
  });

  it('calls card component with correct props', () => {
    const staticApp = mkTool();
    const submit = jest.fn();

    render(
      <FormContent
        tenant='knuffingen'
        state={{ isInitial: true }}
        isLoading={false}
        submitForm={submit}
        staticApp={staticApp}
        staticAppBaseUrl={STATICAPP_BASE_URL}
        isCityToolAdmin
      />,
    );

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: staticApp.meta.displayName,
        description: staticApp.meta.description,
        pictureUri: 'https://path/to/picture.jpg',
        categories: CAT_LABELS,
        href: undefined,
        target: '_blank',
        isLoading: false,
        state: {
          type: 'installable',
          typeText: 'Installieren',
          onClick: expect.any(Function),
          href: undefined,
        },
        installation: undefined,
        creator: 'static-app',
        creatorTooltip: 'Statische App',
      }),
      undefined,
    );
  });

  it('calls card component with correct props when not admin', () => {
    const staticApp = mkTool();
    const submit = jest.fn();

    render(
      <FormContent
        tenant='knuffingen'
        state={{ isInitial: true }}
        isLoading={false}
        isCityToolAdmin={false}
        submitForm={submit}
        staticApp={staticApp}
        staticAppBaseUrl={STATICAPP_BASE_URL}
      />,
    );

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: staticApp.meta.displayName,
        description: staticApp.meta.description,
        pictureUri: 'https://path/to/picture.jpg',
        href: undefined,
        target: '_blank',
        isLoading: false,
        state: {
          type: 'request',
          typeText: 'Zugriff anfordern',
          onClick: undefined,
          href: EXPECTED_REQUEST_LINK,
        },
        installation: undefined,
        creator: 'static-app',
        creatorTooltip: 'Statische App',
      }),
      undefined,
    );
  });

  it.each([
    ['no path and index path', true, undefined, undefined, undefined],
    [
      'path but no index path',
      true,
      'masterportal',
      undefined,
      `${STATICAPP_BASE_URL}/guetersloh/masterportal`,
    ],
    ['no path but index path', true, undefined, '/index/basic', undefined],
    ['not installed card', false, 'any', 'any', undefined],
  ])(
    'passes correct href to card for %s',
    (_, isInstalled, path, indexPath, expected) => {
      const staticApp = mkTool(isInstalled, path, indexPath);
      const submit = jest.fn();

      render(
        <FormContent
          tenant='knuffingen'
          state={{ isInitial: true }}
          isLoading={false}
          submitForm={submit}
          staticApp={staticApp}
          staticAppBaseUrl={STATICAPP_BASE_URL}
        />,
      );

      expect(UdpCityToolCard).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expected,
        }),
        undefined,
      );
    },
  );

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
            tenant='knuffingen'
            state={{ isInitial: false, data: {} }}
            isLoading={false}
            submitForm={jest.fn()}
            staticApp={mkTool(isInstalled)}
            staticAppBaseUrl={STATICAPP_BASE_URL}
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
            tenant='knuffingen'
            state={{ isInitial: false, errors: {} }}
            isLoading={false}
            submitForm={jest.fn()}
            staticApp={mkTool(isInstalled)}
            staticAppBaseUrl={STATICAPP_BASE_URL}
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

  describe('permissions', () => {
    it('hides install button when hideInstallButton is true', () => {
      const staticApp = mkTool(false);
      const submit = jest.fn();

      render(
        <FormContent
          tenant='knuffingen'
          state={{ isInitial: true }}
          isLoading={false}
          submitForm={submit}
          staticApp={staticApp}
          staticAppBaseUrl={STATICAPP_BASE_URL}
          hideInstallButton
          isCityToolAdmin
        />,
      );

      expect(UdpCityToolCard).toHaveBeenCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({
            type: 'installable',
            onClick: expect.any(Function),
          }),
          hideInstallButton: true,
        }),
        undefined,
      );
    });
  });

  it('hides delete button when hideDeleteButton is true', () => {
    const staticApp = mkTool(true);
    const submit = jest.fn();

    render(
      <FormContent
        tenant='knuffingen'
        state={{ isInitial: true }}
        isLoading={false}
        submitForm={submit}
        staticApp={staticApp}
        staticAppBaseUrl={STATICAPP_BASE_URL}
        hideDeleteButton
      />,
    );

    expect(UdpCityToolCard).toHaveBeenCalledWith(
      expect.objectContaining({
        state: expect.objectContaining({ type: 'installed' }),
        hideDeleteButton: true,
      }),
      undefined,
    );
  });
});
