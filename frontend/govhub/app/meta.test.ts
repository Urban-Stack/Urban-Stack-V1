import { mkMetadata } from '@/app/meta';
import { requireTenantMeta } from '@/app/_lib/resource-api/legacy';
import { FuncMock } from '@/app/_test/utils';

const requireTenantMetaMock = requireTenantMeta as unknown as FuncMock<
  typeof requireTenantMeta
>;

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenantMeta: jest.fn(),
}));

const META_PROPS = {
  params: Promise.resolve({}),
  searchParams: Promise.resolve({}),
};

beforeEach(() => {
  requireTenantMetaMock.mockReset();
});

describe('description', () => {
  it('contains default description if no tenant name is provided', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({});

    const metadata = await mkMetadata()(META_PROPS);

    expect(metadata.description).toEqual('Urban Government Hub');
  });

  it('contains default description with tenant name', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({ 'tenant-name': 'Gütersloh' });

    const metadata = await mkMetadata()(META_PROPS);

    expect(metadata.description).toEqual('Urban Government Hub Gütersloh');
  });

  it('contains provided description with no tenant name', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({});
    const mkDescription: () => string = () => 'My custom description';

    const metadata = await mkMetadata({ mkDescription })(META_PROPS);

    expect(metadata.description).toEqual('My custom description');
  });

  it('contains provided description with tenant name', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({ 'tenant-name': 'Gütersloh' });
    const mkDescription: (tenantName?: string) => string = (tenantName) =>
      `My custom description for ${tenantName}`;

    const metadata = await mkMetadata({ mkDescription })(META_PROPS);

    expect(metadata.description).toEqual('My custom description for Gütersloh');
  });
});

describe('title', () => {
  it('shows correct title if no page name & no tenant name is provided', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({});

    const metadata = await mkMetadata()(META_PROPS);

    expect(metadata.title).toEqual('UGH');
  });

  it('shows correct title if page name but no tenant name is provided', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({});

    const metadata = await mkMetadata({ pageName: 'My page' })(META_PROPS);

    expect(metadata.title).toEqual('My page | UGH');
  });

  it('shows correct title if no page name but tenant name is provided', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({ 'tenant-name': 'Gütersloh' });

    const metadata = await mkMetadata()(META_PROPS);

    expect(metadata.title).toEqual('UGH Gütersloh');
  });

  it('shows correct title if page name and tenant name is provided', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({ 'tenant-name': 'Gütersloh' });

    const metadata = await mkMetadata({ pageName: 'Settings' })(META_PROPS);

    expect(metadata.title).toEqual('Settings | UGH Gütersloh');
  });

  it('constructs title if page name is a function', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({});

    const metadata = await mkMetadata({
      pageName: (params) => `My page ${params.id}`,
    })({ ...META_PROPS, params: Promise.resolve({ id: '1' }) });

    expect(metadata.title).toEqual('My page 1 | UGH');
  });
});
