import { ChangeEvent } from 'react';
import { FileInput, HelperText, Label } from 'flowbite-react';
import { twMerge } from 'tailwind-merge';
import {
  IcCloudArrow,
  IcFile,
  IcFileCircleXMark,
  UdpProgressBar,
} from 'udp-ui/components';
import { ObjectUploadTestIds } from '@/app/filemanager/_internal/testIds';

export const Dropzone = ({
  id,
  file,
  progress,
  onFileChange,
  errTxtInvalidFile = 'Dateiname ungültig!',
  isValid = false,
}: {
  progress: number | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  errTxtInvalidFile?: string;
  file?: File | null;
  isValid?: boolean;
} & Pick<HTMLElement, 'id'>) => (
  <div className='flex flex-col gap-1 w-full items-start justify-center'>
    <Label
      htmlFor={id}
      className='relative flex h-64 w-full p-8 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-wrap'
    >
      <div className='flex flex-col items-center justify-center pb-6 pt-5 max-w-[25rem] w-full text-gray-500 '>
        <FileIcon file={file ?? undefined} isValid={isValid} />
        {file ? (
          <div className='flex flex-col gap-3.5 mb-2 text-sm text-gray-500 font-semibold text-center'>
            <p className={twMerge('font-bold', isValid && 'text-black')}>
              {file.name}
            </p>
            {!!progress && (
              <UdpProgressBar progress={progress} className='w-full min-w-96' />
            )}
          </div>
        ) : (
          <div className='text-center'>
            <p className='mb-2 text-sm font-bold'>
              Drag and Drop oder hier klicken, um Datei auszuwählen
            </p>
            <p className='text-xs'>
              Nur CSV Dateien mit <code>*.csv</code> Endung gültig.
            </p>
          </div>
        )}
      </div>
      <FileInput
        id={id}
        name='file'
        className='absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer'
        onChange={onFileChange}
        disabled={progress !== null}
        data-testid={ObjectUploadTestIds.fileInput}
      />
    </Label>

    {!!file && !isValid && (
      <HelperText className='text-danger-500 text-wrap'>
        {errTxtInvalidFile}
      </HelperText>
    )}
  </div>
);

const FileIcon = ({ file, isValid }: { file?: File; isValid: boolean }) => {
  if (!file) return <IcCloudArrow className='mb-2 size-10' />;
  if (isValid) return <IcFile className='mb-2 size-10 text-primary-700' />;
  else return <IcFileCircleXMark className='mb-2 size-10 text-gray-500' />;
};
