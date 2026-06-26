import { render, screen } from '@testing-library/react';
import FileManagerPage from './page';
import { toProjects } from '@/app/_lib/resource-api/project';
import { fetchAllProjects } from '@/app/_lib/resource-api/graphql/project';
import {
  AllTenantAndProjectScopes,
  GetAllTenantAndProjectScopes,
} from '@/app/_lib/resource-api/graphql/tenant';
import { FuncMock } from '@/app/_test/utils';
import { requireTenant } from '@/app/_lib/resource-api/legacy';

jest.mock('@/app/filemanager/_internal/BucketSelector', () => () => (
  <div data-testid='mock-bucket-selector' />
));

jest.mock('@/app/filemanager/_internal/BucketContent', () => () => (
  <div data-testid='mock-bucket-content' />
));

jest.mock('@/app/_lib/resource-api/project', () => ({
  toProjects: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/project', () => ({
  fetchAllProjects: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  GetAllTenantAndProjectScopes: jest.fn(),
}));

const queryScopesMock: FuncMock<typeof GetAllTenantAndProjectScopes> =
  GetAllTenantAndProjectScopes as unknown as jest.Mock;

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));
const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;

beforeAll(() => {
  requireTenantMock.mockResolvedValue('test-tenant');
});

describe('S3ManagerPage', () => {
  it('shows Fallback if no projects exist', async () => {
    (fetchAllProjects as jest.Mock).mockResolvedValueOnce([]);
    (toProjects as jest.Mock).mockReturnValueOnce([]);
    queryScopesMock.mockResolvedValueOnce({
      data: {
        tenants: [],
      },
    } as unknown as AllTenantAndProjectScopes);

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
    queryScopesMock.mockResolvedValueOnce({
      data: {
        tenants: [],
      },
    } as unknown as AllTenantAndProjectScopes);
    (fetchAllProjects as jest.Mock).mockResolvedValueOnce(['some raw data']);
    (toProjects as jest.Mock).mockReturnValueOnce([{ id: 1 }]);

    render(await FileManagerPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByTestId('mock-bucket-selector')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-bucket-content')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Noch keine Projekte vorhanden.'),
    ).not.toBeInTheDocument();
  });

  it('shows bucket content if bucket in search params', async () => {
    (fetchAllProjects as jest.Mock).mockResolvedValueOnce(['some raw data']);
    (toProjects as jest.Mock).mockReturnValueOnce([{ id: 1 }]);
    queryScopesMock.mockResolvedValueOnce({
      data: {
        tenants: [],
      },
    } as unknown as AllTenantAndProjectScopes);

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
