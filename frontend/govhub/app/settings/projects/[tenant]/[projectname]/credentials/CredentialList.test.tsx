import { render } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import CredentialList from '@/app/settings/projects/[tenant]/[projectname]/credentials/CredentialList';
import { CredentialTestIds } from '@/app/settings/projects/[tenant]/[projectname]/credentials/testIds';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { queryAllCredentials } from '@/app/_lib/resource-api/graphql/credentials';
import { SensorCredential } from '@/app/_lib/resource-api/project/credentials';
import CredentialTable from '@/app/settings/projects/[tenant]/[projectname]/credentials/CredentialTable';
import React from 'react';
import { mockQueryAllCredentials } from '@/app/_test/graphql/mock.util';

const queryAllCredentialsMock: FuncMock<typeof queryAllCredentials> =
  queryAllCredentials as unknown as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/credentials', () => ({
  queryAllCredentials: jest.fn(),
}));

jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/credentials/CredentialTable',
  () => ({
    __esModule: true,
    default: jest.fn(() => (
      <div data-testid={CredentialTestIds.table}>mocked table</div>
    )),
  }),
);

const TENANT = 'tenant1';
const PROJECT = 'project1';
const CREDENTIALS: SensorCredential[] = [
  { name: 'cred1', username: 'name1', _tag: 'SensorCredential' },
  { name: 'cred2', username: 'name2', _tag: 'SensorCredential' },
  { name: 'cred3', username: 'name3', _tag: 'SensorCredential' },
];

const mockCredentials = mockQueryAllCredentials(queryAllCredentialsMock);

beforeEach(() => {
  queryAllCredentialsMock.mockReset();
});

describe('snapshot', () => {
  it('renders list overview as expected', async () => {
    mockCredentials(CREDENTIALS);

    const { container } = render(
      await CredentialList({ tenant: TENANT, project: PROJECT }),
    );

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('credential overview represents received credentials by means of table', async () => {
    mockCredentials(CREDENTIALS);

    const component = render(
      await CredentialList({ tenant: TENANT, project: PROJECT }),
    );

    const table = component.getByTestId(CredentialTestIds.table);
    const fallback = component.queryByTestId(SettingsTestIds.fallback);

    expect(CredentialTable).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: TENANT,
        project: PROJECT,
        credentials: CREDENTIALS,
      }),
      undefined,
    );

    expect(table).toBeVisible();
    expect(fallback).not.toBeInTheDocument();
  });

  it('shows "no credentials" fallback', async () => {
    mockCredentials([]);

    const component = render(
      await CredentialList({ tenant: TENANT, project: PROJECT }),
    );

    const table = component.queryByTestId(CredentialTestIds.table);
    const fallback = component.queryByTestId(SettingsTestIds.fallback);

    expect(table).not.toBeInTheDocument();
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent('Noch keine Credentials vorhanden');
    expect(fallback).toHaveTextContent(
      'Sie können hier neue Credentials erstellen.',
    );
  });

  it('shows "unknown error" fallback', async () => {
    mockCredentials(
      [],
      new CombinedGraphQLErrors({ errors: [{ message: '' }] }),
    );

    const component = render(
      await CredentialList({ tenant: TENANT, project: PROJECT }),
    );

    const table = component.queryByTestId(CredentialTestIds.table);
    const fallback = component.queryByTestId(SettingsTestIds.fallback);

    expect(table).not.toBeInTheDocument();
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent(
      'Credentials konnten nicht geladen werden',
    );
    expect(fallback).toHaveTextContent(
      'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    );
  });
});
