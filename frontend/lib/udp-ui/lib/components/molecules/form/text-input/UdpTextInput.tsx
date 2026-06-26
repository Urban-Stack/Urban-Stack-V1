import React, { Ref } from 'react';
import { HelperText, TextInput, TextInputProps } from 'flowbite-react';
import { twMerge } from 'tailwind-merge';
import { UdpIcon } from '@/lib/components/icons';

type UdpTextInputProps = Omit<TextInputProps, 'color' | 'icon'> & {
  icon?: UdpIcon;
  errors?: string[];
  ref?: Ref<HTMLInputElement>;
} & React.InputHTMLAttributes<HTMLInputElement>;

const UdpTextInput = ({
  className,
  type = 'text',
  errors,
  ...restProps
}: UdpTextInputProps) => (
  <>
    <TextInput
      className={twMerge(
        'focus:outline-hidden focus:ring-2 focus:ring-primary-500',
        className,
      )}
      type={type}
      color={errors ? 'failure' : 'gray'}
      {...restProps}
    />
    {errors && (
      <HelperText color='failure'>
        {errors.map((t, idx) => (
          <span key={idx}>
            {t}
            <br />
          </span>
        ))}
      </HelperText>
    )}
  </>
);

export default UdpTextInput;
