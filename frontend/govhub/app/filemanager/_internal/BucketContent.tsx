import { NoSearchResultIcon, UdpFallback, UdpIcon } from 'udp-ui/components';
import { splitBucketName, StorageObject } from '@/app/_lib/storage/common';
import React from 'react';
import ObjectTable from '@/app/filemanager/ObjectTable';
import ObjectUpload from '@/app/filemanager/ObjectUpload';
import { fetchObjects } from '@/app/_lib/storage/server';
import { isRight } from 'udp-ui/fp';
import { queryAllDatasets } from '@/app/_lib/resource-api/graphql/datasets';
import { Dataset, toDatasets } from '@/app/_lib/resource-api/project/dataset';
import {
  hasScopeForProject,
  Scope,
} from '@/app/_lib/resource-api/permission/scope';

const BucketContent = async ({
  bucket,
  projectPermissions,
}: {
  bucket: string;
  projectPermissions: Map<string, Scope[]>;
}) => {
  const split = splitBucketName(bucket);
  if (!split) return <FallbackInvalidBucketName />;
  const { tenant, project } = split;

  const mObjects = await fetchObjects(bucket);
  const datasets = await queryAllDatasets(tenant, project).then(toDatasets);
  const canManageFiles = hasScopeForProject(
    projectPermissions,
    'project:admin',
    project,
  );
  return isRight(mObjects) ? (
    <Content
      tenant={tenant}
      project={project}
      objects={mObjects.right}
      bucket={bucket}
      datasets={datasets}
      canManageFiles={canManageFiles}
    />
  ) : (
    <FallbackNoBucket />
  );
};

const Content = ({
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
  <div className='flex flex-col size-full gap-10'>
    {canManageFiles && <ObjectUpload bucket={bucket} />}
    {objects.length === 0 ? (
      <FallbackNoObjects />
    ) : (
      <ObjectTable
        tenant={tenant}
        project={project}
        bucket={bucket}
        objects={objects}
        datasets={datasets}
        canManageFiles={canManageFiles}
      />
    )}
  </div>
);

const FallbackNoObjects = () => (
  <div className='flex size-full items-center justify-center'>
    <UdpFallback
      icon={NoSearchResultIcon as UdpIcon}
      title='Noch keine Dateien vorhanden.'
      description='Es wurden noch keine Dateien in diesem Bucket hochgeladen. Laden Sie Dateien hoch, um sie hier anzuzeigen.'
      className='max-w-[30rem]'
    />
  </div>
);

const FallbackNoBucket = () => (
  <div className='flex size-full items-center justify-center'>
    <UdpFallback
      icon={NoSearchResultIcon as UdpIcon}
      title='Noch kein Bucket für Projekt vorhanden.'
      description='Dies kann vorkommen, wenn Sie gerade ein neues Projekt erstellt haben. Bitte versuchen Sie es in einer Minute erneut.'
      className='max-w-[30rem]'
    />
  </div>
);

const FallbackInvalidBucketName = () => (
  <div className='flex size-full items-center justify-center'>
    <UdpFallback
      icon={NoSearchResultIcon as UdpIcon}
      title='Ungültiger Bucket-Name'
      description='Der Bucket-Name ist ungültig oder der Bucket existiert nicht. Bitte überprüfen Sie den Namen und versuchen Sie es erneut.'
      className='max-w-[30rem]'
    />
  </div>
);
export default BucketContent;
