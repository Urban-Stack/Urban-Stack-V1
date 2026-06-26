import AppSidebar, { AppSidebarTestIds, PATHS } from '@/app/AppSidebar';
import { render, within } from '@testing-library/react';
import { setLocalStorage } from '@/app/_lib/client/localStorage';
import { useNotificationCount } from '@/app/_lib/discourse/iframe-communication/useNotificationCount';
import { FuncMock } from '@/app/_test/utils';
import { usePathname } from 'next/navigation';
import { mkCommunityHref } from '@/app/_lib/discourse/util';
import userEvent from '@testing-library/user-event';
import { useIframeReset } from '@/app/_lib/client/iframeResetStorage';
import { CitytoolLink } from '@/app/_lib/citytools';

const USER = userEvent.setup();

const DISCOURSE_BASE_URL = 'https://discourse.example.com';
const JUPYTERHUB_URL = 'https://jupyterhub.example.com';
const CKAN_URL = 'https://ckan.example.com';
const DOCS_URL = 'https://docs.example.com';
const CITIZENHUB_URL = 'https://citizenhub.example.com/tenant';

const useNotificationCountMock: FuncMock<typeof useNotificationCount> =
  useNotificationCount as unknown as jest.Mock;
const usePathnameMock: FuncMock<typeof usePathname> =
  usePathname as unknown as jest.Mock;

jest.mock(
  '@/app/_lib/discourse/iframe-communication/useNotificationCount',
  () => ({
    useNotificationCount: jest.fn(),
  }),
);

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const useIframeResetMock = useIframeReset as unknown as jest.Mock;
jest.mock('@/app/_lib/client/iframeResetStorage', () => ({
  useIframeReset: jest.fn(),
}));

const renderSidebar = (citytools: CitytoolLink[] = []) =>
  render(
    <AppSidebar
      discourseBaseUrl={DISCOURSE_BASE_URL}
      jupyterhubUrl={JUPYTERHUB_URL}
      citizenhubUrl={CITIZENHUB_URL}
      ckanUrl={CKAN_URL}
      docsUrl={DOCS_URL}
      citytools={citytools}
    />,
  );

beforeAll(() => {
  useIframeResetMock.mockReset();
  useNotificationCountMock.mockReset();
  usePathnameMock.mockReturnValue('/');
});

describe('properties', () => {
  it('is expanded if local storage key "UGH_SIDEBAR_OPEN" contains "true"', () => {
    setLocalStorage('UGH_SIDEBAR_OPEN', 'true');

    const component = renderSidebar();
    expect(component.getByTestId(AppSidebarTestIds.self)).toHaveClass(
      'min-w-64',
    );
  });

  it('is collapsed if local storage key "UGH_SIDEBAR_OPEN" contains "false"', () => {
    setLocalStorage('UGH_SIDEBAR_OPEN', 'false');

    const component = renderSidebar();
    expect(component.getByTestId(AppSidebarTestIds.self)).not.toHaveClass(
      'min-w-16',
    );
  });

  it('contains correct menu entries', () => {
    const menuEntries = [
      ['Startseite', '/'],
      ['Dashboards', '/dashboards'],
      ['Community', '/community'],
      ['Chat', '/chat?path=%2Fchat%2Fdirect-messages'],
      ['City Tools', '/citytools'],
      ['Datei-Manager', '/filemanager'],
      ['JupyterHub', JUPYTERHUB_URL],
      ['CKAN', CKAN_URL],
      ['AI Demo', '/aidemo'],
      ['CitizenHub', CITIZENHUB_URL],
      ['Helpdesk', '/helpdesk'],
      ['Dokumentation', DOCS_URL],
      ['Einstellungen', '/settings/profile'],
    ];

    const component = renderSidebar();

    expect(component.getAllByRole('listitem')).toHaveLength(menuEntries.length);
    menuEntries.forEach(([name, url]) => {
      const menuEntry = component.getByRole('link', { name });
      expect(menuEntry).toBeVisible();
      expect(menuEntry).toHaveAttribute('href', url);
    });
  });

  describe('City Tools menu entry', () => {
    const citytools = [
      { displayName: 'Tool A', href: 'https://tools.example.com/a' },
      { displayName: 'Tool B', href: 'https://tools.example.com/b' },
    ];

    it('renders a collapse with overview and tool links when sidebar is open and tools exist', async () => {
      setLocalStorage('UGH_SIDEBAR_OPEN', 'true');

      const component = renderSidebar(citytools);

      expect(component.getByText('City Tools')).toBeVisible();

      await USER.click(component.getByRole('button', { name: 'City Tools' }));

      expect(
        component.getByRole('link', { name: 'Übersicht' }),
      ).toHaveAttribute('href', PATHS.citytools);
      citytools.forEach((tool) => {
        const link = component.getByRole('link', { name: tool.displayName });
        expect(link).toHaveAttribute('href', tool.href);
        expect(link).toHaveAttribute('target', '_blank');
      });
    });

    it('renders a single City Tools link when sidebar is collapsed', () => {
      setLocalStorage('UGH_SIDEBAR_OPEN', 'false');

      const component = renderSidebar(citytools);

      expect(
        component.getByRole('link', { name: 'City Tools' }),
      ).toHaveAttribute('href', PATHS.citytools);
      expect(
        component.queryByRole('link', { name: 'Übersicht' }),
      ).not.toBeInTheDocument();
      citytools.forEach((tool) => {
        expect(
          component.queryByRole('link', { name: tool.displayName }),
        ).not.toBeInTheDocument();
      });
    });

    it('renders a single City Tools link when no citytools are installed', () => {
      setLocalStorage('UGH_SIDEBAR_OPEN', 'true');

      const component = renderSidebar([]);

      expect(
        component.getByRole('link', { name: 'City Tools' }),
      ).toHaveAttribute('href', PATHS.citytools);
      expect(
        component.queryByRole('link', { name: 'Übersicht' }),
      ).not.toBeInTheDocument();
    });
  });

  it.each(
    Object.values({
      ...PATHS,
      chat: mkCommunityHref('/chat/direct-messages', {
        basePage: PATHS.chat,
      }),
    }),
  )('Path %s: highlights the active menu entry', (path) => {
    usePathnameMock.mockReturnValue(path);

    const component = renderSidebar();

    within(component.getByTestId(AppSidebarTestIds.mainNav))
      .getAllByRole('link')
      .forEach((menuEntry) => {
        if (menuEntry.getAttribute('href') === path) {
          expect(menuEntry).toHaveClass('text-primary-700');
          expect(menuEntry.querySelector('svg')).toHaveClass(
            'text-primary-700',
          );
        } else {
          expect(menuEntry).not.toHaveClass('text-primary-700');
        }
      });
  });

  describe('Community menu entry', () => {
    beforeEach(() => {
      useNotificationCountMock.mockImplementation((baseUrl) =>
        baseUrl === DISCOURSE_BASE_URL ? { notificationUnread: '42' } : {},
      );
    });

    it('renders Community menu entry bold if notification count is set', () => {
      const component = renderSidebar();

      expect(component.getByRole('link', { name: 'Community' })).toHaveClass(
        'font-bold',
      );
      expect(component.getByRole('link', { name: 'Chat' })).not.toHaveClass(
        'font-bold',
      );
    });

    it('renders Community icon red if notification count is set & sidebar is collapsed', () => {
      setLocalStorage('UGH_SIDEBAR_OPEN', 'false');

      const component = renderSidebar();

      expect(
        within(component.getByRole('link', { name: 'Community' })).getByTestId(
          'flowbite-sidebar-item-icon',
        ),
      ).toHaveClass('text-danger-600');
      expect(component.getByRole('link', { name: 'Chat' })).not.toHaveClass(
        'text-danger-600',
      );
    });

    it('click on Community entry induces reset for Discourse iframe', async () => {
      const resetIframeMock = jest.fn();
      useIframeResetMock.mockReturnValue(resetIframeMock);
      const component = renderSidebar();

      const communityEntry = component.getByRole('link', { name: 'Community' });
      await USER.click(communityEntry);

      expect(resetIframeMock).toHaveBeenCalledWith('DISCOURSE');
    });
  });

  describe('Chat menu entry', () => {
    beforeEach(() => {
      useNotificationCountMock.mockImplementation((baseUrl) =>
        baseUrl === DISCOURSE_BASE_URL ? { chatUnread: '42' } : {},
      );
    });

    it('renders Chat menu entry bold if notification count is set', () => {
      const component = renderSidebar();

      expect(component.getByRole('link', { name: 'Chat' })).toHaveClass(
        'font-bold',
      );
      expect(
        component.getByRole('link', { name: 'Community' }),
      ).not.toHaveClass('text-danger-600');
    });

    it('renders Chat icon red if notification count is set & sidebar is collapsed', () => {
      setLocalStorage('UGH_SIDEBAR_OPEN', 'false');

      const component = renderSidebar();

      expect(
        within(component.getByRole('link', { name: 'Chat' })).getByTestId(
          'flowbite-sidebar-item-icon',
        ),
      ).toHaveClass('text-danger-600');
      expect(
        component.getByRole('link', { name: 'Community' }),
      ).not.toHaveClass('text-danger-600');
    });

    it('click on Chat entry induces reset for Discourse iframe', async () => {
      const resetIframeMock = jest.fn();
      useIframeResetMock.mockReturnValue(resetIframeMock);
      const component = renderSidebar();

      const chatEntry = component.getByRole('link', { name: 'Chat' });
      await USER.click(chatEntry);

      expect(resetIframeMock).toHaveBeenCalledWith('DISCOURSE');
    });
  });
});
