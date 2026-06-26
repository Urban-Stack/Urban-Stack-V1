'use client';

import React from 'react';
import SettingsTable from '@/app/settings/_common/SettingsTable';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import {
  mkVizGroupHref,
  VizGroup,
} from '@/app/_lib/resource-api/viz-groups/vizGroups';
import { VizGroupTestIds } from '@/app/settings/dashboardgroups/testIds';
import { redirect, useSearchParams } from 'next/navigation';
import {
  hasScopeForVizGroup,
  Scope,
} from '@/app/_lib/resource-api/permission/scope';
import { UdpBadge } from 'udp-ui/components';
import { twMerge } from 'tailwind-merge';
import { SEARCH_PARAMS } from '@/app/settings/dashboardgroups/common';

export interface VizGroupTableProps {
  vizGroups: VizGroup[];
  scopeMap: Map<string, Map<string, Scope[]>>;
}
const filterVizGroups = (vizGroups: VizGroup[], searchTextRaw: string) => {
  const searchText = searchTextRaw.toLowerCase();
  return vizGroups.filter(
    (vizGroup) =>
      vizGroup.name.toLowerCase().includes(searchText) ||
      vizGroup.tenant.toLowerCase().includes(searchText),
  );
};

const VizGroupsTable: React.FC<VizGroupTableProps> = ({
  vizGroups,
  scopeMap,
}) => {
  const isVizGroupAdmin = (vizGroupName: string, tenant: string) =>
    hasScopeForVizGroup(scopeMap, 'viz-group:admin', vizGroupName, tenant);
  const searchParams = useSearchParams();
  const searchText = searchParams.get(SEARCH_PARAMS.search) ?? '';
  const filteredVizGroups = filterVizGroups(vizGroups, searchText);

  return (
    <SettingsTable data-testid={VizGroupTestIds.table}>
      <TableHead>
        <TableRow>
          <TableHeadCell>Name</TableHeadCell>
          <TableHeadCell>Mandant</TableHeadCell>
          <TableHeadCell>Berechtigung</TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody className={'divide-y text-gray-900'}>
        {filteredVizGroups.map((v) => (
          <VizGroupTableItem
            key={`${v.tenant}_${v.name}`}
            vizGroup={v}
            disabled={!isVizGroupAdmin(v.name, v.tenant)}
            isVizGroupAdmin={isVizGroupAdmin(v.name, v.tenant)}
          />
        ))}
      </TableBody>
    </SettingsTable>
  );
};

interface VizGroupTableItemProps {
  vizGroup: VizGroup;
  disabled?: boolean;
  isVizGroupAdmin: boolean;
}

const VizGroupTableItem: React.FC<VizGroupTableItemProps> = ({
  vizGroup,
  disabled = false,
  isVizGroupAdmin,
}) => {
  const redirectOnEnter = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      redirect(mkVizGroupHref(vizGroup.tenant, vizGroup.name));
    }
  };

  return (
    <TableRow
      data-testid={VizGroupTestIds.tableItem}
      className={twMerge(
        disabled ? 'cursor-auto' : 'cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-primary-300',
      )}
      tabIndex={disabled ? -1 : 0}
      onClick={
        disabled
          ? undefined
          : () => redirect(mkVizGroupHref(vizGroup.tenant, vizGroup.name))
      }
      onKeyDown={redirectOnEnter}
    >
      <TableCell>{vizGroup.name}</TableCell>
      <TableCell>{vizGroup.tenant}</TableCell>
      <TableCell>
        <UdpBadge className='w-fit'>
          {isVizGroupAdmin ? 'Mitarbeiter' : 'Betrachter'}
        </UdpBadge>
      </TableCell>
    </TableRow>
  );
};

export default VizGroupsTable;
