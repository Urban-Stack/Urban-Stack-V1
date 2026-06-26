'use client';

import React, { ChangeEvent, useRef, useState } from 'react';
import { Tooltip } from 'flowbite-react';
import {
  IcEdit,
  UdpBadge,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpToast,
} from 'udp-ui/components';
import { Dropzone } from '@/app/filemanager/_internal/Dropzone';
import { fetchUploadUrl } from '@/app/api/storage/upload/common';
import { uploadWithProgress } from '@/app/_lib/storage/client';
import { useRouter } from 'next/navigation';
import { refreshDataset } from '@/app/filemanager/_internal/dataset/actions';
import Form from 'next/form';

const ReplaceBadge = ({
  objectKey,
  bucket,
  tenant,
  project,
  dataset,
}: {
  objectKey: string;
  bucket: string;
  tenant: string;
  project: string;
  dataset: string;
}) => (
  <UdpClientModal
    title={`Datei "${objectKey}" ersetzen?`}
    content={(props) => (
      <ModalContent
        objectKey={objectKey}
        bucket={bucket}
        {...props}
        tenant={tenant}
        project={project}
        dataset={dataset}
      />
    )}
    size='2xl'
  >
    <div>
      <Tooltip content='Datei ersetzen' className='text-nowrap'>
        <UdpBadge square onClick={() => {}}>
          <IcEdit className='size-4' />
        </UdpBadge>
      </Tooltip>
    </div>
  </UdpClientModal>
);

const ModalContent = ({
  objectKey,
  bucket,
  closeModal,
  initialFocusRef,
  tenant,
  project,
  dataset,
}: {
  objectKey: string;
  bucket: string;
  tenant: string;
  project: string;
  dataset: string;
} & UdpClientModalContentProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const successUpload = UdpToast('Datei erfolgreich ersetzt', 'success');
  const errorUpload = UdpToast('Datei konnte nicht ersetzt werden', 'error');

  const uploadObject = () => {
    if (!file) return;

    setProgress(1);

    fetchUploadUrl(bucket, file)
      .then(({ url, fields }) =>
        uploadWithProgress(
          file,
          {
            url,
            fields,
          },
          setProgress,
        ),
      )
      .then(() => refreshDataset(tenant, project, dataset, bucket))
      .then(() => {
        successUpload();
        setFile(null);
        closeModal();
      })
      .catch(errorUpload)
      .finally(() => {
        setProgress(null);
        router.refresh();
      });
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFile(e.target.files?.[0] ?? null);
  const isValid = !!file && objectKey == file.name;
  return (
    <Form
      ref={formRef}
      action={uploadObject}
      className='bg-white flex flex-col gap-5'
    >
      <p className='p-4 rounded-lg bg-yellow-100 text-yellow-700'>
        Wenn eine Datei ersetzt wird, können Dashboards, die auf diese Datei
        zugreifen, beschädigt werden und funktionieren möglicherweise nicht mehr
        richtig!
      </p>
      <Dropzone
        id='s3-object-replace'
        file={file}
        progress={progress}
        isValid={isValid}
        errTxtInvalidFile={`Dateiname muss mit der bestehenden Datei übereinstimmen. Erwartet: ${objectKey}`}
        onFileChange={onFileChange}
      />
      <div className='flex gap-3.5'>
        <UdpButton
          type='submit'
          className='w-fit'
          disabled={!file || !isValid}
          loading={progress !== null}
        >
          Datei ersetzen
        </UdpButton>
        <UdpButton color='secondary' onClick={closeModal} ref={initialFocusRef}>
          Abbrechen
        </UdpButton>
      </div>
    </Form>
  );
};

export default ReplaceBadge;
