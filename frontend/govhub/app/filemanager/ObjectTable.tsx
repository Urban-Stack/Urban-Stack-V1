'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tooltip,
} from 'flowbite-react';
import { ObjectTableTestIds } from '@/app/filemanager/_internal/testIds';
import { sizeHumanReadable } from '@/app/_lib/misc/misc';
import React from 'react';
import { cmpByDateDesc, StorageObject } from '@/app/_lib/storage/common';
import DeleteBadge from '@/app/filemanager/_internal/delete/DeleteBadge';
import { IcDownload, UdpBadge, UdpScrollWrapper } from 'udp-ui/components';
import Link from 'next/link';
import { Dataset } from '@/app/_lib/resource-api/project/dataset';
import DatasetBadge from '@/app/filemanager/_internal/dataset/DatasetBadge';
import ReplaceBadge from '@/app/filemanager/_internal/ReplaceBadge';

const ObjectTable = ({
  tenant,
  project,
  bucket,
  objects,
  datasets,
  canManageFiles,
}: {
  tenant: string;
  project: string;
  bucket: string;
  objects: StorageObject[];
  datasets: ReadonlyMap<string, Dataset>;
  canManageFiles: boolean;
}) => (
  <UdpScrollWrapper className='h-full'>
    <Table
      data-testid={ObjectTableTestIds.table}
      className='whitespace-nowrap'
      hoverable
    >
      <TableHead>
        <TableRow>
          <TableHeadCell>Dateiname</TableHeadCell>
          <TableHeadCell>Zuletzt geändert</TableHeadCell>
          <TableHeadCell>Größe</TableHeadCell>
          <TableHeadCell>Dataset erstellt</TableHeadCell>
          <TableHeadCell className='w-0' />
        </TableRow>
      </TableHead>
      <TableBody className={'divide-y text-gray-900'}>
        {objects.toSorted(cmpByDateDesc).map((o) => (
          <TableRow
            key={o.key}
            data-testid={ObjectTableTestIds.tableRow}
            className='group'
          >
            <TableCell>{o.key}</TableCell>
            <TableCell>{o.lastModified.toLocaleString('de-DE')}</TableCell>
            <TableCell>
              {sizeHumanReadable(o.sizeInBytes) ?? 'unbekannt'}
            </TableCell>
            <TableCell>
              <DatasetBadge
                tenant={tenant}
                project={project}
                bucket={bucket}
                object={o}
                dataset={datasets.get(o.key)}
                canManageFiles={canManageFiles}
              />
            </TableCell>
            <TableCell>
              <ActionsContainer
                tenant={tenant}
                project={project}
                object={o}
                bucket={bucket}
                dataset={datasets.get(o.key)}
                canManageFiles={canManageFiles}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </UdpScrollWrapper>
);

const ActionsContainer = ({
  object,
  bucket,
  tenant,
  project,
  dataset,
  canManageFiles,
}: {
  object: StorageObject;
  bucket: string;
  tenant: string;
  project: string;
  dataset?: Dataset;
  canManageFiles: boolean;
}) => (
  <div className='flex justify-end gap-2.5'>
    <div
      className='flex gap-2.5 group-hover:visible lg:invisible'
      data-testid={ObjectTableTestIds.downloadBadge}
    >
      <Tooltip content='Datei herunterladen' className='text-nowrap'>
        <UdpBadge href={object.downloadHref} linkAs={Link} square>
          <IcDownload className='size-4' />
        </UdpBadge>
      </Tooltip>
    </div>
    {dataset && canManageFiles && (
      <div
        className='flex gap-2.5 group-hover:visible lg:invisible'
        data-testid={ObjectTableTestIds.replaceBadge}
      >
        <ReplaceBadge
          objectKey={object.key}
          bucket={bucket}
          tenant={tenant}
          project={project}
          dataset={dataset.name}
        />
      </div>
    )}
    {canManageFiles && (
      <div
        className='flex gap-2.5 group-hover:visible lg:invisible'
        data-testid={ObjectTableTestIds.deleteBadge}
      >
        <DeleteBadge
          tenant={tenant}
          project={project}
          dataset={dataset?.name}
          objectKey={object.key}
          bucket={bucket}
        />
      </div>
    )}
  </div>
);
export default ObjectTable;
