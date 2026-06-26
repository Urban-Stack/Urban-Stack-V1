import { mkMetadata } from '@/app/meta';
import { FuncMock } from '@/app/_test/utils';
import { publicAttributes } from '@/app/_lib/resource-api/attributes/publicAttributes';

const publicAttributesMock = publicAttributes as unknown as FuncMock<
  typeof publicAttributes
>;

jest.mock('@/app/_lib/resource-api/attributes/publicAttributes', () => ({
  publicAttributes: jest.fn(),
}));

const META_PROPS = {
  params: Promise.resolve({ tenant: 'guetersloh' }),
  searchParams: Promise.resolve({}),
};

const EMPTY_META_PROPS = {
  params: Promise.resolve({}),
  searchParams: Promise.resolve({}),
};

beforeEach(() => {
  publicAttributesMock.mockReset();
});

describe('description', () => {
  it('contains default description if no tenant name is provided', async () => {
    publicAttributesMock.mockResolvedValueOnce({});

    const metadata = await mkMetadata()(META_PROPS);

    expect(metadata.description).toEqual('Citizen Hub');
  });

  it('contains default description if no tenant in params', async () => {
    publicAttributesMock.mockResolvedValueOnce({});

    const metadata = await mkMetadata()(EMPTY_META_PROPS);

    expect(metadata.description).toEqual('Citizen Hub');
  });

  it('contains default description with tenant name', async () => {
    publicAttributesMock.mockResolvedValueOnce({
      tenantDisplayName: 'Gütersloh',
    });

    const metadata = await mkMetadata()(META_PROPS);

    expect(metadata.description).toEqual('Citizen Hub Gütersloh');
  });

  it('contains provided description with no tenant name', async () => {
    publicAttributesMock.mockResolvedValueOnce({});
    const mkDescription: () => string = () => 'My custom description';

    const metadata = await mkMetadata({ mkDescription })(META_PROPS);

    expect(metadata.description).toEqual('My custom description');
  });

  it('contains provided description with tenant name', async () => {
    publicAttributesMock.mockResolvedValueOnce({
      tenantDisplayName: 'Gütersloh',
    });
    const mkDescription: (tenantName?: string) => string = (tenantName) =>
      `My custom description for ${tenantName}`;

    const metadata = await mkMetadata({ mkDescription })(META_PROPS);

    expect(metadata.description).toEqual('My custom description for Gütersloh');
  });
});

describe('title', () => {
  it('shows correct title if no page name & no tenant name is provided', async () => {
    publicAttributesMock.mockResolvedValueOnce({});

    const metadata = await mkMetadata()(EMPTY_META_PROPS);

    expect(metadata.title).toEqual('UCH');
  });

  it('shows correct title if page name but no tenant name is provided', async () => {
    publicAttributesMock.mockResolvedValueOnce({});

    const metadata = await mkMetadata({ pageName: 'My page' })(
      EMPTY_META_PROPS,
    );

    expect(metadata.title).toEqual('My page | UCH');
  });

  it('shows correct title if no page name but tenant name is provided', async () => {
    publicAttributesMock.mockResolvedValueOnce({
      tenantDisplayName: 'Gütersloh',
    });

    const metadata = await mkMetadata()(META_PROPS);

    expect(metadata.title).toEqual('UCH Gütersloh');
  });

  it('shows correct title if page name and tenant name is provided', async () => {
    publicAttributesMock.mockResolvedValueOnce({
      tenantDisplayName: 'Gütersloh',
    });

    const metadata = await mkMetadata({ pageName: 'Settings' })(META_PROPS);

    expect(metadata.title).toEqual('Settings | UCH Gütersloh');
  });

  it('constructs title if page name is a function', async () => {
    publicAttributesMock.mockResolvedValueOnce({});

    const metadata = await mkMetadata({
      pageName: (params) => `My page ${params.id}`,
    })({ ...META_PROPS, params: Promise.resolve({ id: '1' }) });

    expect(metadata.title).toEqual('My page 1 | UCH');
  });
});
