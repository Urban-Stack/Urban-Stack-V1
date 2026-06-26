'use client';

import {
  Dataset,
  DatasetFormat,
  unsafeToDatasetFormat,
} from '@/app/_lib/resource-api/project/dataset';
import { canBeUsedForDataset, StorageObject } from '@/app/_lib/storage/common';
import {
  UdpBadge,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpToast,
} from 'udp-ui/components';
import { ObjectTableTestIds } from '../testIds';
import React, { ReactNode, useActionState, useEffect } from 'react';
import Form from 'next/form';
import {
  createDataset,
  deleteDataset,
} from '@/app/filemanager/_internal/dataset/actions';
import { ModalSizes, Tooltip } from 'flowbite-react';
import { ActionState } from '@/app/_lib/form/actionstate';
import { DynamicStringEnumKeysOf } from 'flowbite-react/types';
import { useRouter } from 'next/navigation';
import { DatasetBadgeTestIds as TestIds } from '@/app/filemanager/_internal/dataset/testIds';

type ModalData = {
  readonly title: string;
  readonly size: DynamicStringEnumKeysOf<ModalSizes>;
  readonly content: React.FC<UdpClientModalContentProps>;
};

const mkCreateModalData = (
  tenant: string,
  project: string,
  format: DatasetFormat,
  filename: string,
) =>
  ({
    title: 'Datei verknüpfen',
    size: 'lg',
    content: (contentProps) => (
      <CreateModalContent
        tenant={tenant}
        project={project}
        format={format}
        filename={filename}
        {...contentProps}
      />
    ),
  }) as ModalData;

const mkDeleteModalData = (
  tenant: string,
  project: string,
  datasetName: string | undefined,
  filename: string,
) =>
  ({
    title: 'Verknüpfung aufheben',
    size: 'xl',
    content: (contentProps) => (
      <DeleteModalContent
        tenant={tenant}
        project={project}
        datasetName={datasetName}
        filename={filename}
        {...contentProps}
      />
    ),
  }) as ModalData;

const DatasetBadge = ({
  object,
  tenant,
  project,
  bucket,
  dataset,
  canManageFiles,
}: {
  object: StorageObject;
  tenant: string;
  project: string;
  bucket: string;
  dataset?: Dataset;
  canManageFiles: boolean;
}) =>
  !canBeUsedForDataset(object) ? (
    <Tooltip
      className={'hidden lg:block'}
      content='Nur CSV- oder JSON-Dateien ohne Leerzeichen können verknüpft werden.'
    >
      <Badge disabled>Nicht Verknüpft</Badge>
    </Tooltip>
  ) : (
    <InternalDatasetBadge
      object={object}
      tenant={tenant}
      project={project}
      bucket={bucket}
      dataset={dataset}
      canManageFiles={canManageFiles}
    />
  );

const InternalDatasetBadge = ({
  object,
  tenant,
  project,
  dataset,
  canManageFiles,
}: {
  object: StorageObject;
  tenant: string;
  project: string;
  bucket: string;
  dataset?: Dataset;
  canManageFiles: boolean;
}) => {
  const format = unsafeToDatasetFormat(object.filetype);

  const modalData = dataset
    ? mkDeleteModalData(tenant, project, dataset?.name, object.key)
    : mkCreateModalData(tenant, project, format, object.key);

  return canManageFiles ? (
    <UdpClientModal
      title={modalData.title}
      size={modalData.size}
      content={modalData.content}
    >
      <div>
        <Badge canEdit>{dataset ? 'Verknüpft' : 'Nicht Verknüpft'}</Badge>
      </div>
    </UdpClientModal>
  ) : (
    <div>
      <Badge>{dataset ? 'Verknüpft' : 'Nicht Verknüpft'}</Badge>
    </div>
  );
};

const Badge = ({
  disabled = false,
  canEdit = false,
  children,
}: {
  disabled?: boolean;
  canEdit?: boolean;
  children: ReactNode;
}) => (
  <UdpBadge
    className='w-fit'
    disabled={disabled}
    onClick={disabled || !canEdit ? undefined : () => {}}
    data-testid={ObjectTableTestIds.datasetBadge}
  >
    {children}
  </UdpBadge>
);

/* c8 ignore start */
const CreateModalContent = ({
  tenant,
  project,
  filename,
  format,
  initialFocusRef,
  closeModal,
}: {
  tenant: string;
  project: string;
  filename: string;
  format: DatasetFormat;
} & UdpClientModalContentProps) => {
  const router = useRouter();
  const [createState, createFormAction, isLoadingCreate] = useActionState(
    createDataset.bind(null, tenant, project, filename, format),
    { isInitial: true },
  );

  useEffect(() => {
    handleAction(
      createState,
      'Dataset wurde erfolgreich erstellt.',
      `Dataset konnte nicht erstellt werden.\n${createState.errors?.general?.join('\n') ?? ''}`,
      closeModal,
      () => router.refresh(),
    );
  }, [createState, closeModal, router]);

  return (
    <Form action={createFormAction} data-testid={TestIds.createModal}>
      <FormContentCreate
        filename={filename}
        isLoading={isLoadingCreate}
        initialFocusRef={initialFocusRef}
        closeModal={closeModal}
      />
    </Form>
  );
};

const DeleteModalContent = ({
  tenant,
  project,
  datasetName,
  filename,
  initialFocusRef,
  closeModal,
}: {
  tenant: string;
  project: string;
  datasetName?: string;
  filename: string;
} & UdpClientModalContentProps) => {
  const router = useRouter();
  const [deleteState, deleteFormAction, isLoadingDelete] = useActionState(
    deleteDataset.bind(null, tenant, project, datasetName ?? ''),
    { isInitial: true },
  );

  useEffect(() => {
    handleAction(
      deleteState,
      'Dataset wurde erfolgreich gelöscht.',
      `Dataset konnte nicht gelöscht werden.\n${deleteState?.errors?.general?.join('\n') ?? ''}`,
      closeModal,
      () => router.refresh(),
    );
  }, [deleteState, closeModal, router]);

  return (
    <Form action={deleteFormAction} data-testid={TestIds.deleteModal}>
      <FormContentDelete
        filename={filename}
        isLoading={isLoadingDelete}
        initialFocusRef={initialFocusRef}
        closeModal={closeModal}
      />
    </Form>
  );
};
/* c8 ignore stop */

const handleAction = (
  actionState: ActionState,
  successMessage: string,
  errorMessage: string,
  onSuccess: () => void,
  refresh: () => void,
) => {
  if (actionState.isInitial) return;

  if (actionState.errors) UdpToast(errorMessage, 'error')();
  else if (actionState.data) {
    UdpToast(successMessage, 'success')();
    onSuccess();
  }
  refresh();
};

const FormContentCreate = ({
  isLoading,
  filename,
  initialFocusRef,
  closeModal,
}: {
  isLoading: boolean;
  filename: string;
} & UdpClientModalContentProps) => (
  <div className='flex flex-col gap-6'>
    <p>Datei &quot;{filename}&quot; mit Dashboards verknüpfen?</p>
    <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
      <UdpButton type='submit' loading={isLoading} ref={initialFocusRef}>
        Verknüpfung erstellen
      </UdpButton>
      <UdpButton color='tertiary' onClick={closeModal}>
        Abbrechen
      </UdpButton>
    </div>
  </div>
);

const FormContentDelete = ({
  filename,
  isLoading,
  initialFocusRef,
  closeModal,
}: {
  filename: string;
  isLoading: boolean;
} & UdpClientModalContentProps) => (
  <div className='flex flex-col gap-6'>
    <p>Verknüpfung zu &quot;{filename}&quot; wirklich aufheben?</p>
    <div className='flex flex-col text-wrap gap-2 p-4 rounded-lg bg-yellow-100 text-yellow-700'>
      <p className='text-sm'>
        Alle Dashboards, die auf diese Datei zugreifen, werden durch das
        Aufheben der Verknüpfung beschädigt oder funktioniert nicht mehr
        richtig! Bitte überprüfen Sie, ob diese Datei für Dashboards verwendet
        wird!
      </p>
    </div>
    <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
      <UdpButton type='submit' loading={isLoading} color='danger'>
        Verknüpfung aufheben
      </UdpButton>
      <UdpButton color='tertiary' onClick={closeModal} ref={initialFocusRef}>
        Abbrechen
      </UdpButton>
    </div>
  </div>
);

export default DatasetBadge;

export const internal = {
  FormContentCreate,
  FormContentDelete,
};
