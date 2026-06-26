'use client';

import React from 'react';
import { Table } from 'flowbite-react';
import { UdpScrollWrapper } from 'udp-ui/components';
import { twMerge } from 'tailwind-merge';

type SettingsTableProps = {
  className?: string;
  children: React.ReactNode;
};

const SettingsTable = ({
  className,
  children,
  ...restProps
}: SettingsTableProps) => (
  <UdpScrollWrapper gradClassName='from-primary-50 w-32' className='h-full'>
    <Table
      hoverable
      className={twMerge('rounded-xl', className)}
      {...restProps}
    >
      {children}
    </Table>
  </UdpScrollWrapper>
);

export default SettingsTable;
