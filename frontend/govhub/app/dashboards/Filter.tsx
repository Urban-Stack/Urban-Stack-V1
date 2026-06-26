'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SEARCH_PARAMS } from '@/app/dashboards/_internal/common';
import {
  UdpFilterButton,
  UdpFilterOption,
  UdpToggleButton,
} from 'udp-ui/components';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';

export const STATUS_OPTIONS = ['published', 'intern'] as const;
export type StatusOption = (typeof STATUS_OPTIONS)[number];

const STATUS_LABEL: Readonly<Record<StatusOption, string>> = {
  intern: 'Intern',
  published: 'Veröffentlicht',
};

const Filter = ({
  vizGroups = [],
  className,
}: {
  vizGroups?: VizGroup[];
  className?: string;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const favorites: boolean =
    searchParams.get(SEARCH_PARAMS.favorites) == 'true';
  const statusFilter = searchParams.get(SEARCH_PARAMS.status)?.split(',') ?? [];
  const vizgroupFilter =
    searchParams.get(SEARCH_PARAMS.vizgroups)?.split(',') ?? [];

  const onFavoriteChange = (value: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(SEARCH_PARAMS.favorites, String(value));
    } else {
      params.delete(SEARCH_PARAMS.favorites);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const statusOptions = STATUS_OPTIONS.map((id) => ({
    id,
    label: STATUS_LABEL[id],
    checked: statusFilter.includes(id),
  })) satisfies (UdpFilterOption & { id: StatusOption })[];

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

  const vizgroupOptions: UdpFilterOption[] = vizGroups.map((vg) => ({
    id: `${vg.tenant}_${vg.name}`,
    label: `${vg.name} (${vg.tenant})`,
    checked: vizgroupFilter.includes(`${vg.tenant}_${vg.name}`),
  }));

  const onVizgroupChange = (options: UdpFilterOption[]) => {
    const checked = options.filter((o) => o.checked).map((o) => o.id);
    const params = new URLSearchParams(searchParams);
    if (checked.length > 0) {
      params.set(SEARCH_PARAMS.vizgroups, checked.join(','));
    } else {
      params.delete(SEARCH_PARAMS.vizgroups);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <section
      className={twMerge(
        'flex flex-col sm:flex-row gap-3 items-start sm:items-center',
        className,
      )}
    >
      <p className='text-gray-800 font-bold'>Filtern nach:</p>
      <div className='flex flex-wrap sm:flex-row gap-3'>
        <UdpToggleButton checked={favorites} onChange={onFavoriteChange}>
          Favoriten
        </UdpToggleButton>
        <UdpFilterButton
          label='Status'
          options={statusOptions}
          onChange={onStatusChange}
        />
        {vizGroups.length > 0 && (
          <UdpFilterButton
            label='Dashboard-Gruppen'
            options={vizgroupOptions}
            onChange={onVizgroupChange}
          />
        )}
      </div>
    </section>
  );
};

export default Filter;
