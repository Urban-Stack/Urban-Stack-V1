'use client';

import React, { useState } from 'react';
import { Label } from 'flowbite-react';
import {
  IcBell,
  IcCheckCircle,
  IcClone,
  UdpButton,
  UdpClientModalContentProps,
  UdpTextInput,
} from 'udp-ui/components';
import { CredentialTestIds as TestIds } from '@/app/settings/projects/[tenant]/[projectname]/credentials/testIds';
import { twMerge } from 'tailwind-merge';

type RevealCredentialsModalContentProps = {
  username?: string;
  password?: string;
} & UdpClientModalContentProps;

const RevealCredentialsModalContent = ({
  username,
  password,
  closeModal,
}: RevealCredentialsModalContentProps) => {
  const [copied, setCopied] = useState(false);

  const copyCredentialsToClipboard = async () => {
    await navigator.clipboard.writeText(
      `Benutzername: ${username}\nPasswort: ${password}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className='flex flex-col gap-4' data-testid={TestIds.revealModal}>
      <WarnMessage />
      <div className='flex flex-col gap-5'>
        <LabeledTextInput
          id='username-input'
          label='Benutzername'
          value={username}
        />
        <LabeledTextInput
          id='password-input'
          label='Passwort'
          value={password}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <CopyMessage copied={copied} />
        <ButtonGroup
          copyCredentials={copyCredentialsToClipboard}
          closeModal={closeModal}
        />
      </div>
    </div>
  );
};

const WarnMessage = () => (
  <div className='flex gap-2 p-4 rounded-lg bg-yellow-100 text-yellow-700'>
    <div>
      <IcBell className='size-5 mt-0.5' />
    </div>
    <p>
      Achten Sie darauf, dass Sie Ihre Sensor Credentials jetzt kopieren. Sie
      werden später nicht mehr sichtbar sein!
    </p>
  </div>
);

const LabeledTextInput = ({
  id,
  label,
  value,
}: {
  id: string;
  label: string;
  value: string | undefined;
}) => (
  <div className='flex flex-col'>
    <Label htmlFor={id} className='pb-2'>
      {label}
    </Label>
    <UdpTextInput id={id} value={value} />
  </div>
);

const CopyMessage = ({ copied }: { copied: boolean }) => (
  <div
    data-testid={TestIds.copyMessage}
    className={twMerge(
      'flex gap-1.5 text-green-500 transition-opacity duration-300',
      copied ? 'opacity-100 visible' : 'opacity-0 invisible',
    )}
  >
    <div>
      <IcCheckCircle className='mt-0.5 size-5' />
    </div>
    <p className='w-full'>Credentials wurden in die Zwischenablage kopiert!</p>
  </div>
);

const ButtonGroup = ({
  copyCredentials,
  closeModal,
}: {
  copyCredentials: () => Promise<void>;
  closeModal: () => void;
}) => (
  <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
    <UdpButton
      icon={IcClone}
      color='secondary'
      onClick={() => void copyCredentials()}
    >
      Sensor Credentials kopieren
    </UdpButton>
    <UdpButton
      color='tertiary'
      className='text-danger-600'
      onClick={closeModal}
    >
      Schließen
    </UdpButton>
  </div>
);

export default RevealCredentialsModalContent;
