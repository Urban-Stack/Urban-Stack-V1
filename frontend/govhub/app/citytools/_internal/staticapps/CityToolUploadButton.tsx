'use client';

import {
  IcFileUpload,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpToast,
} from 'udp-ui/components';
import React, { ChangeEvent, useState } from 'react';
import { createTheme, Tooltip } from 'flowbite-react';
import { useRouter } from 'next/navigation';
import Form from 'next/form';
import { Dropzone } from './Dropzone';
import { requestPresignedZipUploadUrl } from './actions';
import { uploadCityToolZip } from '@/app/_lib/citytools/client';

const CityToolUploadButton = ({
  bucket,
  title,
  replace = false,
}: {
  bucket: string;
  title: string;
  replace?: boolean;
}) => (
  <UdpClientModal
    title={title}
    content={(props) => (
      <ModalContent bucket={bucket} replace={replace} {...props} />
    )}
    size='2xl'
  >
    <UdpButton
      color='tertiary'
      data-testid='udp-citytool-card-upload'
      className='p-0 w-6 h-6 justify-center rounded-md bg-indigo-100'
    >
      <Tooltip
        content={title}
        placement='bottom'
        className='grow'
        theme={createTheme({ base: 'max-w-96', target: 'flex' })}
      >
        <IcFileUpload className='size-5' />
      </Tooltip>
    </UdpButton>
  </UdpClientModal>
);

const ModalContent = ({
  bucket,
  replace = false,
  closeModal,
  initialFocusRef,
}: {
  bucket: string;
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
    );

  const uploadZip = async () => {
    if (!file) return;

    setProgress(1);
    try {
      const result = await requestPresignedZipUploadUrl(bucket);
      console.log('Presigned URL response:', result);

      const response = await uploadCityToolZip(
        file,
        result.uploadUrl,
        setProgress,
      );
      console.log('Upload response:', response);

      successUpload();
      setFile(null);
      closeModal();
    } catch (error) {
      errorUpload(error);
    } finally {
      setProgress(null);
      router.refresh();
    }
  };

  const validFilename = (filename: string): boolean => {
    const ZIP_FILENAME_REGEX = /^[\sa-zA-Z0-9()+,.;:=@_/-]+\.zip$/i;
    return ZIP_FILENAME_REGEX.test(filename);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFile(e.target.files?.[0] ?? null);

  const isValid = !!file && file.size > 0 && validFilename(file.name);

  return (
    <Form action={uploadZip} className='bg-white flex flex-col gap-5'>
      <Dropzone
        id='static-citytool-upload'
        file={file}
        progress={progress}
        isValid={isValid}
        errTxtInvalidFile={
          'Es werden nur Dateien mit einer *.zip Endung unterstützt.'
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

export default CityToolUploadButton;
