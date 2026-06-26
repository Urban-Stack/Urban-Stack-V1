'use client';

import React, { useEffect, useRef, useState } from 'react';
import UdpTextInput from '@/lib/components/molecules/form/text-input/UdpTextInput.tsx';
import { UdpButton } from '@/lib/components/atoms/button';
import { registerResetListener } from '@/lib/components/molecules/form/misc/misc.tsx';

type UdpImageInputProps = {
  id?: string;
  name?: string;
  className?: string;
  currentImageUrl?: string;
  placeholder: string;
  imageHeading?: string;
  imageAlt: string;
  removeButtonText: string;
  disabled?: boolean;
  errors?: string[];
};

const UdpImageInput = ({
  id,
  name,
  className,
  currentImageUrl,
  placeholder,
  imageHeading,
  imageAlt,
  removeButtonText,
  errors,
  disabled = false,
  ...restProps
}: UdpImageInputProps) => {
  const [imageUrl, setImageUrl] = useState<string>(currentImageUrl || '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    registerResetListener(inputRef, () => setImageUrl(currentImageUrl || ''));
  }, [currentImageUrl]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
  };

  const isUrl = (url: string): boolean => {
    try {
      return !!new URL(url);
    } catch (_) {
      return false;
    }
  };

  return (
    <div className={className} {...restProps}>
      <UdpTextInput
        id={id}
        name={name}
        placeholder={placeholder}
        value={imageUrl}
        onChange={handleInputChange}
        errors={errors}
        ref={inputRef}
        disabled={disabled}
      />

      {imageHeading && <p className='text-gray-300 mt-4'>{imageHeading}</p>}
      <div className='flex items-end'>
        <div className='max-w-56 bg-gray-100 p-4 border border-gray-300 rounded-xl'>
          {imageUrl && isUrl(imageUrl) && <img src={imageUrl} alt={imageAlt} />}
        </div>
        {imageUrl && isUrl(imageUrl) && (
          <UdpButton
            color='danger'
            className='ml-2'
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            {removeButtonText}
          </UdpButton>
        )}
      </div>
    </div>
  );
};

export default UdpImageInput;
