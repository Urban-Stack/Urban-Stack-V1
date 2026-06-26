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
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { UserGroupTableTestIds as TestIds } from '@/app/settings/usergroups/testIds';
import Link from 'next/link';
import {
  IcArrowUpRightFromSquare,
  IcCheckCircle,
  UdpBadge,
} from 'udp-ui/components';
import { AllTenantAndProjectScopes } from '@/app/_lib/resource-api/graphql/tenant';
import { isGroupAdminInAnyTenant } from '@/app/_lib/resource-api/permission/scope';
import { redirect, useSearchParams } from 'next/navigation';
import {
  mkUserGroupHref,
  scopeString,
} from '@/app/settings/usergroups/_internal/util';
import { twMerge } from 'tailwind-merge';
import { SEARCH_PARAMS } from '@/app/settings/usergroups/common';

interface UserGroupTableProps {
  userGroups: UserGroup[];
  keycloakBaseUrl: string;
  tenant: string;
  isTenantAdmin?: boolean;
  scopes: AllTenantAndProjectScopes;
}
const filterUserGroups = (userGroups: UserGroup[], searchTextRaw: string) => {
  const searchText = searchTextRaw.toLowerCase();
  return userGroups.filter(
    (userGroup) =>
      userGroup.name.toLowerCase().includes(searchText) ||
      userGroup.tenant.toLowerCase().includes(searchText),
  );
};

const UserGroupTable: React.FC<UserGroupTableProps> = ({
  userGroups,
  keycloakBaseUrl,
  scopes,
  tenant,
  isTenantAdmin = false,
}) => {
  const hasAdminPermission = isTenantAdmin || isGroupAdminInAnyTenant(scopes);
  const searchParams = useSearchParams();
  const searchText = searchParams.get(SEARCH_PARAMS.search) ?? '';
  const filteredUserGroups = filterUserGroups(userGroups, searchText);

  return (
    <SettingsTable data-testid={TestIds.self}>
      <TableHead>
        <TableRow>
          <TableHeadCell>Name</TableHeadCell>
          <TableHeadCell>Mandant</TableHeadCell>
          <TableHeadCell>Berechtigungen</TableHeadCell>
          <TableHeadCell>Mitglied</TableHeadCell>
          {hasAdminPermission && <TableHeadCell>Geteilt</TableHeadCell>}
          {hasAdminPermission && (
            <TableHeadCell>
              <span className='sr-only'>Adminbereich</span>
            </TableHeadCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredUserGroups.map((group) => (
          <UserGroupTableRow
            key={`${group.tenant}_${group.name}`}
            group={group}
            keycloakBaseUrl={keycloakBaseUrl}
            hasAdminPermission={hasAdminPermission}
            isTenantAdmin={isTenantAdmin}
            tenant={tenant}
          />
        ))}
      </TableBody>
    </SettingsTable>
  );
};

type UserGroupTableRowProps = {
  group: UserGroup;
  keycloakBaseUrl: string;
  hasAdminPermission?: boolean;
  isTenantAdmin: boolean;
  tenant: string;
};

const UserGroupTableRow: React.FC<UserGroupTableRowProps> = ({
  group,
  keycloakBaseUrl,
  hasAdminPermission = false,
  isTenantAdmin,
  tenant,
}) => {
  const isGroupAdmin = group.scopes?.granted?.includes('group:admin');
  const hasEditPermission =
    isGroupAdmin || (isTenantAdmin && group.tenant === tenant);

  const redirectIfPermitted = () =>
    hasEditPermission && redirect(mkUserGroupHref(group.tenant, group.name));
  const redirectOnEnter = (event: React.KeyboardEvent<HTMLTableRowElement>) =>
    (event.key === 'Enter' || event.key === ' ') && redirectIfPermitted();

  return (
    <TableRow
      data-testid={TestIds.row}
      onClick={redirectIfPermitted}
      className={twMerge(hasEditPermission && 'cursor-pointer')}
      tabIndex={0}
      onKeyDown={redirectOnEnter}
    >
      <TableCell>{group.name}</TableCell>
      <TableCell>{group.tenant}</TableCell>
      <TableCell data-testid={TestIds.scopes}>
        <div className='flex'>
          <UdpBadge className='h-6'>{scopeString(group.scopes)}</UdpBadge>
        </div>
      </TableCell>
      <TableCell data-testid={TestIds.member}>
        {group.isMember && (
          <IcCheckCircle className='size-5 text-primary-700' />
        )}
      </TableCell>
      {hasAdminPermission && (
        <TableCell data-testid={TestIds.shared}>
          {group.isShared && (
            <IcCheckCircle className='size-5 text-primary-700' />
          )}
        </TableCell>
      )}
      {hasAdminPermission && (
        <TableCell className='w-0'>
          <div className='flex opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100'>
            {hasEditPermission && (
              <Link
                href={`${keycloakBaseUrl}/admin/udh/console/#/udh/groups/${group.keycloakGroupPath}`}
                target='_blank'
                className='p-[2px] hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:rounded-md'
                data-testid={TestIds.adminAreaLink}
                onKeyDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <IcArrowUpRightFromSquare className='size-5' />
              </Link>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};

export default UserGroupTable;
