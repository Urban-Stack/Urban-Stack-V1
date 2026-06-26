import { render } from '@testing-library/react';
import SettingsSidebar, {
  PATHS,
  SettingsSidebarProps,
} from '@/app/settings/SettingsSidebar';
import { FuncMock } from '@/app/_test/utils';
import { usePathname } from 'next/navigation';

const TEST_KEYCLOAK_URL = 'https://keycloak.example.com';

const usePathnameMock: FuncMock<typeof usePathname> =
  usePathname as unknown as jest.Mock;

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

beforeAll(() => {
  usePathnameMock.mockReturnValue('/');
});

describe('snapshot', () => {
  it('matches snapshot', () => {
    const component = render(
      <SettingsSidebar keycloakBaseUrl={TEST_KEYCLOAK_URL} />,
    );

    expect(component).toMatchSnapshot();
  });
});

const testMenuEntries = (
  menuEntries: string[][],
  sidebarProps: SettingsSidebarProps,
) => {
  const component = render(<SettingsSidebar {...sidebarProps} />);

  menuEntries.forEach(([name, url, role]) => {
    const menuEntry = component.getByRole(role, { name });
    expect(menuEntry).toBeVisible();
    if (role === 'link') {
      expect(menuEntry).toHaveAttribute('href', url);
    } else {
      expect(menuEntry).not.toHaveAttribute('href', url);
    }
  });
};

describe('content', () => {
  it('contains correct menu entries', () => {
    const menuEntries = [
      ['Profileinstellungen', '/settings/profile', 'link'],
      ['Mandanteneinstellungen', '/settings/tenants', 'link'],
      ['Projekte', '/settings/projects', 'link'],
      ['Dashboardgruppen', '/settings/dashboardgroups', 'link'],
      ['Benutzergruppen', '/settings/usergroups', 'link'],
      [
        'Benutzerverwaltung',
        `${TEST_KEYCLOAK_URL}/admin/udh/console/#/udh/users/add-user`,
        'link',
      ],
    ];

    testMenuEntries(menuEntries, {
      keycloakBaseUrl: TEST_KEYCLOAK_URL,
      lockTenantSettings: false,
      lockUserManagementLink: false,
    });
  });

  it('correctly locks user management link when set to', () => {
    const menuEntries = [
      ['Profileinstellungen', '/settings/profile', 'link'],
      ['Mandanteneinstellungen', '/settings/tenants', 'link'],
      ['Projekte', '/settings/projects', 'link'],
      ['Dashboardgruppen', '/settings/dashboardgroups', 'link'],
      ['Benutzergruppen', '/settings/usergroups', 'link'],
      [
        'Benutzerverwaltung',
        `${TEST_KEYCLOAK_URL}/admin/udh/console/#/udh/users/add-user`,
        'paragraph',
      ],
    ];

    testMenuEntries(menuEntries, {
      keycloakBaseUrl: TEST_KEYCLOAK_URL,
      lockTenantSettings: false,
      lockUserManagementLink: true,
    });
  });

  it('correctly locks tenant settings button when set to', () => {
    const menuEntries = [
      ['Profileinstellungen', '/settings/profile', 'link'],
      ['Mandanteneinstellungen', '/settings/tenants', 'paragraph'],
      ['Projekte', '/settings/projects', 'link'],
      ['Dashboardgruppen', '/settings/dashboardgroups', 'link'],
      ['Benutzergruppen', '/settings/usergroups', 'link'],
      [
        'Benutzerverwaltung',
        `${TEST_KEYCLOAK_URL}/admin/udh/console/#/udh/users/add-user`,
        'link',
      ],
    ];

    testMenuEntries(menuEntries, {
      keycloakBaseUrl: TEST_KEYCLOAK_URL,
      lockTenantSettings: true,
      lockUserManagementLink: false,
    });
  });

  it('correctly locks tenant settings button and user management link when set to', () => {
    const menuEntries = [
      ['Profileinstellungen', '/settings/profile', 'link'],
      ['Mandanteneinstellungen', '/settings/tenants', 'paragraph'],
      ['Projekte', '/settings/projects', 'link'],
      ['Dashboardgruppen', '/settings/dashboardgroups', 'link'],
      ['Benutzergruppen', '/settings/usergroups', 'link'],
      [
        'Benutzerverwaltung',
        `${TEST_KEYCLOAK_URL}/admin/udh/console/#/udh/users/add-user`,
        'paragraph',
      ],
    ];

    testMenuEntries(menuEntries, {
      keycloakBaseUrl: TEST_KEYCLOAK_URL,
      lockTenantSettings: true,
      lockUserManagementLink: true,
    });
  });

  const expectedExternalLinks = [
    `${TEST_KEYCLOAK_URL}/admin/udh/console/#/udh/users/add-user`,
  ];
  it('contains expected external links', () => {
    usePathnameMock.mockReturnValue('/settings');

    const component = render(
      <SettingsSidebar keycloakBaseUrl={TEST_KEYCLOAK_URL} />,
    );

    component
      .getAllByRole('link')
      .forEach((menuEntry) =>
        expectedExternalLinks.includes(menuEntry.getAttribute('href') ?? '')
          ? expect(menuEntry).toHaveAttribute('target', '_blank')
          : expect(menuEntry).not.toHaveAttribute('target', '_blank'),
      );
  });
});

describe('highlighting', () => {
  const HIGHLIGHT_STYLE = 'bg-primary-100 text-primary-700 font-bold';

  it.each(Object.values(PATHS))(
    'highlights active sidebar item for %s',
    (path) => {
      usePathnameMock.mockReturnValue(path);

      const component = render(
        <SettingsSidebar keycloakBaseUrl={TEST_KEYCLOAK_URL} />,
      );

      component
        .getAllByRole('link')
        .forEach((menuEntry) =>
          menuEntry.getAttribute('href') === path
            ? expect(menuEntry).toHaveClass(HIGHLIGHT_STYLE)
            : expect(menuEntry).not.toHaveClass(HIGHLIGHT_STYLE),
        );
    },
  );
});
