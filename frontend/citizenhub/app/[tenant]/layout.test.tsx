import React from 'react';
import { render } from '@testing-library/react';
import TenantLayout from '@/app/[tenant]/layout';
import DefaultLayout from '@/app/[tenant]/DefaultLayout';

const TEST_TENANT = 'test-tenant';
const TEST_ID_CHILDREN = 'test-children';
const TEST_ID_DEFAULT_LAYOUT = 'mocked-default-layout';

jest.mock('@/app/[tenant]/DefaultLayout', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => (
    <div data-testid={TEST_ID_DEFAULT_LAYOUT}>{children}</div>
  )),
}));

describe('TenantLayout', () => {
  it('renders DefaultLayout with the correct tenant prop and children', async () => {
    const paramsPromise = Promise.resolve({ tenant: TEST_TENANT });
    const children = <div data-testid={TEST_ID_CHILDREN}>Child Content</div>;
    const layout = await TenantLayout({ params: paramsPromise, children });

    const { getByTestId } = render(layout);

    expect(DefaultLayout).toHaveBeenCalledWith(
      { tenant: TEST_TENANT, children },
      undefined,
    );

    expect(getByTestId(TEST_ID_DEFAULT_LAYOUT)).toBeVisible();
    expect(getByTestId(TEST_ID_CHILDREN)).toBeVisible();
  });
});
