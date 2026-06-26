'use client';

import SettingsTable from '@/app/settings/_common/SettingsTable';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tooltip,
} from 'flowbite-react';
import React from 'react';
import { PublishedQuery } from '@/app/_lib/resource-api/viz-groups/publishedQueries';
import { QueryTableTestIds } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/testids';
import DeleteBadge from '@/app/settings/_common/DeleteBadge';
import {
  IcArrowUpRightFromSquare,
  IcEdit,
  IcTrash,
  UdpBadge,
  UdpToast,
} from 'udp-ui/components';
import { deletePublishedQuery } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/action';
import Link from 'next/link';
import { mkHref, mkResultHref } from './util';

interface QueryTableProps {
  tenant: string;
  vizGroup: string;
  queries: PublishedQuery[];
  pubqueryUri: string;
}

const QueryTable = ({
  tenant,
  vizGroup,
  queries,
  pubqueryUri,
}: QueryTableProps) => (
  <SettingsTable data-testid={QueryTableTestIds.self}>
    <TableHead>
      <TableRow>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Query</TableHeadCell>
        <TableHeadCell className='w-0' />
      </TableRow>
    </TableHead>
    <TableBody className='divide-y text-gray-900'>
      {queries.map((q) => (
        <TableRow
          key={q.name}
          data-testid={QueryTableTestIds.row}
          className='group'
        >
          <TableCell>{q.name}</TableCell>
          <TableCell className='max-w-96 truncate'>{q.sql}</TableCell>
          <TableCell>
            <HoverContainer
              tenant={tenant}
              vizGroup={vizGroup}
              name={q.name}
              pubqueryUri={pubqueryUri}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </SettingsTable>
);

type QueryTableItemProps = {
  tenant: string;
  vizGroup: string;
  name: string;
  pubqueryUri: string;
};

const HoverContainer = ({
  tenant,
  vizGroup,
  name,
  pubqueryUri,
}: QueryTableItemProps) => (
  <div className='flex gap-2.5 group-hover:opacity-100 lg:opacity-0'>
    <Tooltip content='Query bearbeiten' className='text-nowrap'>
      <UdpBadge
        square
        linkAs={Link}
        href={mkHref(tenant, vizGroup, name)}
        data-testid={QueryTableTestIds.editBadge}
      >
        <IcEdit className='size-4' />
      </UdpBadge>
    </Tooltip>
    <Tooltip content='Ergebnis anzeigen' className='text-nowrap'>
      <UdpBadge
        square
        linkAs={Link}
        target='_blank'
        href={mkResultHref(tenant, vizGroup, name, pubqueryUri)}
        data-testid={QueryTableTestIds.resultBadge}
      >
        <IcArrowUpRightFromSquare className='size-4' />
      </UdpBadge>
    </Tooltip>
    <InternalDeleteBadge tenant={tenant} vizGroup={vizGroup} name={name} />
  </div>
);

type InternalDeleteBadgeProps = {
  tenant: string;
  vizGroup: string;
  name: string;
};

export const InternalDeleteBadge = ({
  tenant,
  vizGroup,
  name,
}: InternalDeleteBadgeProps) => (
  <DeleteBadge
    tooltipText='Query löschen'
    title='Query löschen'
    description={`Query "${name}" löschen?`}
    onSubmit={() => deletePublishedQuery(tenant, vizGroup, name)}
    onResolved={UdpToast('Query erfolgreich entfernt', 'success')}
    onRejected={UdpToast('Query konnte nicht entfernt werden', 'error')}
    errorsFromState={(state) => state.errors?.general}
  >
    <IcTrash className='size-4' />
  </DeleteBadge>
);

export default QueryTable;
