import { Label } from 'flowbite-react';
import React, { ChangeEvent } from 'react';
import { IcTrash, UdpButton, UdpTextInput } from '@/lib/components';
import { twMerge } from 'tailwind-merge';

interface DangerZoneDialogProps {
  deleteCallback: () => Promise<void>;
  headlineText: string;
  explainerText: string;
  labelText: string;
  resourceName: string;
  className?: string;
}

const UdpDangerZoneDialog = ({
  deleteCallback,
  headlineText,
  explainerText,
  labelText,
  resourceName,
  className,
}: DangerZoneDialogProps) => {
  const [inputValue, setInputValue] = React.useState('');
  const [triggeredCallback, setTriggeredCallback] = React.useState(false);

  const executeCallback = () => {
    setTriggeredCallback(true);
    deleteCallback().finally(() => {
      setTriggeredCallback(false);
    });
  };

  const valueChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const buttonDisabled = inputValue !== resourceName;

  return (
    <div className={twMerge('h-full flex flex-col text-wrap gap-5', className)}>
      <div className='flex flex-row items-center gap-2 text-danger-500 font-semibold'>
        <IcTrash className='size-5 object-center shrink-0' />
        <h3>{headlineText}</h3>
      </div>
      <div className='flex flex-col gap-1 text-danger-500'>
        <p>{explainerText}</p>
      </div>

      <div className='flex flex-col'>
        <Label
          htmlFor='resourcename-input'
          className='pb-2 text-gray-900 text-xs font-normal'
        >
          {labelText}
        </Label>
        <UdpTextInput
          id='resourcename-input'
          value={inputValue}
          onChange={valueChangeHandler}
        />
      </div>
      <UdpButton
        color='danger'
        icon={IcTrash}
        disabled={buttonDisabled}
        className='w-fit'
        onClick={executeCallback}
        loading={triggeredCallback}
      >
        Löschen
      </UdpButton>
    </div>
  );
};

export default UdpDangerZoneDialog;
