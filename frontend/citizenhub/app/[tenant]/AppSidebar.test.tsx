import AppSidebar, {
  AppSidebarTestIds,
  sidebarPaths,
} from '@/app/[tenant]/AppSidebar';
import { render, within } from '@testing-library/react';
import { setLocalStorage } from '@/app/_lib/client/localStorage';
import { FuncMock } from '@/app/_test/utils';
import { usePathname } from 'next/navigation';

const usePathnameMock: FuncMock<typeof usePathname> =
  usePathname as unknown as jest.Mock;

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const TENANT = 'guetersloh';
const CKAN_URL = 'https://ckan.example.com';

beforeAll(() => {
  usePathnameMock.mockReturnValue('/');
});

describe('properties', () => {
  it('is expanded if local storage key "UCH_SIDEBAR_OPEN" contains "true"', () => {
    setLocalStorage('UCH_SIDEBAR_OPEN', 'true');

    const component = render(<AppSidebar tenant={TENANT} ckanUrl={CKAN_URL} />);

    expect(component.getByTestId(AppSidebarTestIds.self)).toHaveClass(
      'min-w-64',
    );
  });

  it('is collapsed if local storage key "UCH_SIDEBAR_OPEN" contains "false"', () => {
    setLocalStorage('UCH_SIDEBAR_OPEN', 'false');

    const component = render(<AppSidebar tenant={TENANT} ckanUrl={CKAN_URL} />);

    expect(component.getByTestId(AppSidebarTestIds.self)).not.toHaveClass(
      'min-w-16',
    );
  });

  it('contains correct menu entries', () => {
    const menuEntries = [
      ['Startseite', `/${TENANT}`],
      ['Dashboards', `/${TENANT}/dashboards`],
      ['City Tools', `/${TENANT}/citytools`],
      ['CKAN', CKAN_URL],
    ];

    const component = render(<AppSidebar tenant={TENANT} ckanUrl={CKAN_URL} />);

    menuEntries.forEach(([name, url]) => {
      const menuEntry = component.getByRole('link', { name });
      expect(menuEntry).toBeVisible();
      expect(menuEntry).toHaveAttribute('href', url);
    });
  });

  const paths = sidebarPaths(TENANT, CKAN_URL);
  const pathsOnSamePage = [paths.homepage, paths.dashboards];
  it.each(Object.values(pathsOnSamePage))(
    'Path %s: highlights the active menu entry',
    (path) => {
      usePathnameMock.mockReturnValue(path);

      const component = render(
        <AppSidebar tenant={TENANT} ckanUrl={CKAN_URL} />,
      );

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
    },
  );
});
