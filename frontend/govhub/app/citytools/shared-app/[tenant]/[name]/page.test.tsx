import { render } from '@testing-library/react';
import EditSharedAppPage from './page';
import EditForm from '@/app/citytools/shared-app/[tenant]/[name]/EditForm';
import { getSharedApp } from '@/app/citytools/shared-app/[tenant]/[name]/actions';

jest.mock('@/app/meta', () => ({ mkMetadata: jest.fn() }));

jest.mock('@/app/citytools/shared-app/[tenant]/[name]/actions', () => ({
  getSharedApp: jest.fn(),
}));

jest.mock('@/app/citytools/shared-app/[tenant]/[name]/EditForm', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('EditSharedAppPage', () => {
  beforeEach(() => {
    (EditForm as unknown as jest.Mock).mockReset();
  });

  it('calls EditForm with empty state on new', async () => {
    const paramsPromise = Promise.resolve({
      tenant: 'tenant1',
      name: 'new',
    });
    render(await EditSharedAppPage({ params: paramsPromise }));

    expect(EditForm).toHaveBeenCalledWith(
      { tenant: 'tenant1', name: 'new', state: {} },
      undefined,
    );
  });

  it('calls EditForm with fetched state on existing', async () => {
    const mockState = { displayName: 'Test App' };
    const params = Promise.resolve({
      tenant: 'tenant1',
      name: 'existingApp',
    });
    (getSharedApp as jest.Mock).mockResolvedValue(mockState);

    render(await EditSharedAppPage({ params }));

    expect(getSharedApp).toHaveBeenCalledWith('tenant1', 'existingApp');
    expect(EditForm).toHaveBeenCalledWith(
      { tenant: 'tenant1', name: 'existingApp', state: mockState },
      undefined,
    );
  });
});
