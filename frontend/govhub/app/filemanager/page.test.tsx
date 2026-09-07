import { render, screen } from '@testing-library/react';
import FileManagerPage from './page';
import { fetchAllProjects } from '@/app/_lib/resource-api/graphql/project';
import { queryHasTenantScope } from '@/app/_lib/resource-api/graphql/tenant';
import { FuncMock } from '@/app/_test/utils';
import { requireTenant } from '@/app/_lib/resource-api/legacy';

jest.mock('@/app/filemanager/_internal/BucketSelector', () => () => (
  <div data-testid='mock-bucket-selector' />
));

jest.mock('@/app/filemanager/_internal/BucketContent', () => () => (
  <div data-testid='mock-bucket-content' />
));

jest.mock('@/app/_lib/resource-api/graphql/project', () => ({
  fetchAllProjects: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  queryHasTenantScope: jest.fn(),
}));

const queryHasTenantScopeMock: FuncMock<typeof queryHasTenantScope> =
  queryHasTenantScope as unknown as jest.Mock;
const fetchAllProjectsMock: FuncMock<typeof fetchAllProjects> =
  fetchAllProjects as unknown as jest.Mock;

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));
const requireTenantMock: FuncMock<typeof requireTenant> =
  requireTenant as unknown as FuncMock<typeof requireTenant>;

beforeAll(() => {
  requireTenantMock.mockResolvedValue('test-tenant');
});

describe('S3ManagerPage', () => {
  it('shows Fallback if no projects exist', async () => {
    fetchAllProjectsMock.mockResolvedValueOnce({
      data: {
        tenants: [],
      },
    });
    queryHasTenantScopeMock.mockResolvedValue(false);

    render(await FileManagerPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByText('Noch keine Projekte vorhanden.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-bucket-selector'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-bucket-content')).not.toBeInTheDocument();
  });

  it('shows bucket selector but no object list if no bucket in search params', async () => {
    queryHasTenantScopeMock.mockResolvedValue(false);
    fetchAllProjectsMock.mockResolvedValueOnce({
      data: {
        tenants: [
          {
            tenant: 'some-tenant',
            projects: [
              {
                project: 'some-project',
                admin: true,
                tenant: 'some-tenant',
              },
            ],
          },
        ],
      },
    });

    render(await FileManagerPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByTestId('mock-bucket-selector')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-bucket-content')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Noch keine Projekte vorhanden.'),
    ).not.toBeInTheDocument();
  });

  it('shows bucket content if bucket in search params', async () => {
    fetchAllProjectsMock.mockResolvedValueOnce({
      data: {
        tenants: [
          {
            tenant: 'some-tenant',
            projects: [
              {
                project: 'some-project',
                admin: true,
                tenant: 'some-tenant',
              },
            ],
          },
        ],
      },
    });
    queryHasTenantScopeMock.mockResolvedValue(false);

    render(
      await FileManagerPage({
        searchParams: Promise.resolve({ bucket: 'test-bucket' }),
      }),
    );
    expect(screen.getByTestId('mock-bucket-selector')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bucket-content')).toBeInTheDocument();
    expect(
      screen.queryByText('Noch keine Projekte vorhanden.'),
    ).not.toBeInTheDocument();
  });
});
