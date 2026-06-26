import { requireTenantMeta } from '@/app/_lib/resource-api/legacy';
import { twMerge } from 'tailwind-merge';

export const AppTenantImageTestIds = {
  self: 'app-tenant-image',
  img: 'app-tenant-image_img',
};

const AppTenantImage = async ({ className }: { className?: string }) => {
  const tenantMeta = await requireTenantMeta();
  const alt = `Mandantenbild ${tenantMeta['tenant-name'] ?? ''}`.trim();

  return tenantMeta['tenant-image'] ? (
    <div
      data-testid={AppTenantImageTestIds.self}
      className={twMerge(
        'h-64 overflow-hidden rounded-2xl shadow-sm',
        className,
      )}
    >
      <img
        data-testid={AppTenantImageTestIds.img}
        src={tenantMeta['tenant-image']}
        alt={alt}
        className='object-cover h-full w-full'
      />
    </div>
  ) : null;
};

export default AppTenantImage;
