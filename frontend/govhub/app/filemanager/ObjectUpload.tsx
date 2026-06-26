'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { uploadWithProgress } from '@/app/_lib/storage/client';
import { fetchUploadUrl } from '@/app/api/storage/upload/common';
import { UdpButton, UdpToast } from 'udp-ui/components';
import { useRouter } from 'next/navigation';
import { fetchExistsFile } from '@/app/api/storage/exists/common';
import { validFilename } from '@/app/_lib/storage/common';
import { Dropzone } from '@/app/filemanager/_internal/Dropzone';
import { ObjectUploadTestIds } from '@/app/filemanager/_internal/testIds';

const ObjectUpload = ({ bucket }: { bucket: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const successUpload = UdpToast('Datei erfolgreich hochgeladen', 'success');
  const errorUpload = UdpToast(
    'Datei konnte nicht hochgeladen werden',
    'error',
  );
  const errorAlreadyExists = UdpToast('Datei existiert bereits', 'error');

  const uploadObject = async () => {
    if (!file) return;

    const doesExist = await fetchExistsFile(bucket, file.name);
    if (doesExist) {
      errorAlreadyExists();
      return;
    }

    setProgress(1);
    const { url, fields } = await fetchUploadUrl(bucket, file);

    await uploadWithProgress(file, { url, fields }, setProgress)
      .then(() => {
        successUpload();
        setFile(null);
      })
      .catch(errorUpload)
      .finally(() => {
        setProgress(null);
        router.refresh();
      });
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFile(e.target.files?.[0] ?? null);
  const onCancel = () => {
    setFile(null);
    formRef.current?.reset();
  };
  const isValid = !!file && file.size > 0 && validFilename(file.name);

  return (
    <form ref={formRef} className='flex flex-col gap-5 w-full max-w-[40rem]'>
      <Dropzone
        id='s3-object-create'
        data-testid={ObjectUploadTestIds.dropZone}
        file={file}
        isValid={isValid}
        errTxtInvalidFile='Datei ungültig! Datei darf nicht leer sein und darf nur Buchstaben, Zahlen und die Sonderzeichen "()+,.;:=@_/-" enthalten.'
        progress={progress}
        onFileChange={onFileChange}
      />
      <div className='flex gap-3.5'>
        <UdpButton
          type='button'
          className='w-fit'
          disabled={!file || !isValid}
          loading={progress !== null}
          onClick={() => {
            void uploadObject();
          }}
        >
          Hochladen
        </UdpButton>
        <UdpButton
          color='secondary'
          onClick={onCancel}
          disabled={progress !== null || !file}
        >
          Abbrechen
        </UdpButton>
      </div>
    </form>
  );
};

export default ObjectUpload;
