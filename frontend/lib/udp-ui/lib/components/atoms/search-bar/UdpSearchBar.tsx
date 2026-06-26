import React from 'react';
import { IcSearch } from '@/lib/components/icons';
import { UdpTextInput } from '@/lib/components/molecules/form/text-input';
import { TextInputProps } from 'flowbite-react';

export type UdpSearchBarProps = Omit<TextInputProps, 'type' | 'icon'> &
  React.InputHTMLAttributes<HTMLInputElement>;

const UdpSearchBar = ({ ...restProps }: UdpSearchBarProps) => (
  <UdpTextInput type={'search'} icon={IcSearch} {...restProps} />
);

export default UdpSearchBar;
