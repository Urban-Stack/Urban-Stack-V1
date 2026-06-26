'use client';

import {
  IcPlus,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpToast,
} from 'udp-ui/components';
import React, { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestPresignedUploadUrl } from '@/app/settings/projects/[tenant]/[projectname]/sensor-metadata/_internal/actions';
import Form from 'next/form';
import { Dropzone } from './Dropzone';
import { validFilename } from '@/app/_lib/sensor-metadata/common';
import { uploadSensorMetadata } from '@/app/_lib/sensor-metadata/client';

const UploadButton = ({
  tenant,
  project,
  replace = false,
}: {
  tenant: string;
  project: string;
  replace?: boolean;
}) => (
  <UdpClientModal
    title='Sensor-Meta-Daten hochladen'
    content={(props) => (
      <ModalContent
        tenant={tenant}
        project={project}
        replace={replace}
        {...props}
      />
    )}
    size='2xl'
  >
    <UdpButton icon={IcPlus}>
      {replace ? 'Meta-Daten austauschen' : 'Meta-Daten hochladen'}
    </UdpButton>
  </UdpClientModal>
);

const ModalContent = ({
  tenant,
  project,
  replace = false,
  closeModal,
  initialFocusRef,
}: {
  tenant: string;
  project: string;
  replace?: boolean;
} & UdpClientModalContentProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const router = useRouter();

  const successUpload = UdpToast('Datei erfolgreich hochgeladen', 'success');
  const errorUpload = (e: unknown) =>
    UdpToast(
      `Datei konnte nicht hochgeladen werden${e instanceof Error ? ': ' + e.message : ''}`,
      'error',
    )();

  const uploadMetadata = () => {
    if (!file) return;

    setProgress(1);

    requestPresignedUploadUrl(tenant, project)
      .then((res) => res.uploadUrl)
      .then((url) => uploadSensorMetadata(file, url, setProgress))
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

  const isValid = !!file && file.size > 0 && validFilename(file.name);

  return (
    <Form action={uploadMetadata} className='bg-white flex flex-col gap-5'>
      <Dropzone
        id='sensor-metadata-upload'
        file={file}
        progress={progress}
        isValid={isValid}
        errTxtInvalidFile={
          'Es werden nur CSV-Dateien mit einer *.csv Endung unterstützt.'
        }
        onFileChange={onFileChange}
      />
      <div className='flex gap-3.5'>
        <UdpButton
          type='submit'
          className='w-fit'
          disabled={!file || !isValid}
          loading={progress !== null}
        >
          {replace ? 'Datei ersetzen' : 'Datei hochladen'}
        </UdpButton>
        <UdpButton
          color='secondary'
          onClick={closeModal}
          ref={initialFocusRef}
          disabled={progress !== null}
        >
          Abbrechen
        </UdpButton>
      </div>
    </Form>
  );
};

export default UploadButton;
