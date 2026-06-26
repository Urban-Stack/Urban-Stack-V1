import React, { Ref } from 'react';
import { HelperText, Textarea, TextareaProps } from 'flowbite-react';
import { twMerge } from 'tailwind-merge';

type UdpTextAreaProps = Omit<TextareaProps, 'color'> & {
  errors?: string[];
  ref?: Ref<HTMLTextAreaElement>;
} & React.AreaHTMLAttributes<HTMLTextAreaElement>;

const UdpTextArea = ({ className, errors, ...restProps }: UdpTextAreaProps) => (
  <>
    <Textarea
      className={twMerge(
        'focus:outline-hidden focus:ring-1 focus:ring-primary-500',
        className,
      )}
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

export default UdpTextArea;
