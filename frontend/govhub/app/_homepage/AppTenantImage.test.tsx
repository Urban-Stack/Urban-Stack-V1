import { requireTenantMeta } from '@/app/_lib/resource-api/legacy';
import { FuncMock } from '@/app/_test/utils';
import { render } from '@testing-library/react';
import TenantImage, {
  AppTenantImageTestIds,
} from '@/app/_homepage/AppTenantImage';

const requireTenantMetaMock = requireTenantMeta as unknown as FuncMock<
  typeof requireTenantMeta
>;

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenantMeta: jest.fn(),
}));

beforeEach(() => {
  requireTenantMetaMock.mockReset();
});

it('renders nothing if no tenant image is available', async () => {
  requireTenantMetaMock.mockResolvedValueOnce({});
  const { container } = render(await TenantImage({}));

  expect(container).toBeEmptyDOMElement();
});

describe('image available', () => {
  const imageUrl = '/image-url';
  it('renders tenant image if available', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({ 'tenant-image': imageUrl });
    const component = render(await TenantImage({}));

    expect(component.getByTestId(AppTenantImageTestIds.self)).toBeVisible();
  });

  it('sets alt attribute to tenant name if available', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({
      'tenant-image': imageUrl,
      'tenant-name': 'Detmold',
    });
    const component = render(await TenantImage({}));

    expect(component.getByTestId(AppTenantImageTestIds.img)).toHaveAttribute(
      'alt',
      'Mandantenbild Detmold',
    );
  });

  it('defaults alt attribute if no tenant name is available', async () => {
    requireTenantMetaMock.mockResolvedValueOnce({
      'tenant-image': imageUrl,
    });
    const component = render(await TenantImage({}));

    expect(component.getByTestId(AppTenantImageTestIds.img)).toHaveAttribute(
      'alt',
      'Mandantenbild',
    );
  });
});
