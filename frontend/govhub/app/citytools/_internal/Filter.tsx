'use client';

import { twMerge } from 'tailwind-merge';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  UdpToggleButton,
  UdpFilterButton,
  UdpFilterOption,
} from 'udp-ui/components';
import { SEARCH_PARAMS } from './searchparams';
import { buildCategoryOptions } from '@/app/citytools/_internal/categories';

export const STATUS_OPTIONS = ['installed', 'not-installed'] as const;
export type StatusOption = (typeof STATUS_OPTIONS)[number];

const STATUS_LABEL: Readonly<Record<StatusOption, string>> = {
  installed: 'Installiert',
  'not-installed': 'Verfügbar zur Installation',
};

const Filter = ({
  isSAAdmin,
  className,
}: {
  isSAAdmin: boolean;
  className?: string;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusFilter = searchParams.get(SEARCH_PARAMS.status)?.split(',') ?? [];
  const categoriesFilter =
    searchParams.get(SEARCH_PARAMS.categories)?.split(',') ?? [];
  const myCityFilter = searchParams.get(SEARCH_PARAMS.myCity) === 'true';

  const statusOptions = STATUS_OPTIONS.map((id) => ({
    id,
    label: STATUS_LABEL[id],
    checked: statusFilter.includes(id),
  })) satisfies (UdpFilterOption & { id: StatusOption })[];

  const categoriesOptions = buildCategoryOptions(categoriesFilter);

  const onStatusChange = (options: UdpFilterOption[]) => {
    const checked = options.filter((o) => o.checked).map((o) => o.id);
    const params = new URLSearchParams(searchParams);
    if (checked.length > 0) {
      params.set(SEARCH_PARAMS.status, checked.join(','));
    } else {
      params.delete(SEARCH_PARAMS.status);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };
  const onCategoryChange = (options: UdpFilterOption[]) => {
    const checked = options.filter((o) => o.checked).map((o) => o.id);
    const params = new URLSearchParams(searchParams);
    if (checked.length > 0) {
      params.set(SEARCH_PARAMS.categories, checked.join(','));
    } else {
      params.delete(SEARCH_PARAMS.categories);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const onMyCityChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (!checked) {
      params.delete(SEARCH_PARAMS.myCity);
    } else {
      params.set(SEARCH_PARAMS.myCity, 'true');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <section className={twMerge('flex gap-3 items-center', className)}>
      <p className='text-gray-800 font-bold'>Filtern nach:</p>
      {isSAAdmin && (
        <UdpFilterButton
          label='Status'
          options={statusOptions}
          onChange={onStatusChange}
          placement='bottom-start'
        />
      )}
      <UdpFilterButton
        label='Kategorie'
        options={categoriesOptions}
        onChange={onCategoryChange}
        placement='bottom-start'
      />
      <UdpToggleButton checked={myCityFilter} onChange={onMyCityChange}>
        Von meiner Stadt
      </UdpToggleButton>
    </section>
  );
};

export default Filter;
