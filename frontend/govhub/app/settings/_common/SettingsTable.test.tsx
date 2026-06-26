import { render } from '@testing-library/react';
import { UdpScrollWrapper } from 'udp-ui/components';
import React from 'react';
import SettingsTable from '@/app/settings/_common/SettingsTable';
import { Table } from 'flowbite-react';
import { twMerge } from 'tailwind-merge';

jest.mock('udp-ui/components', () => ({
  UdpScrollWrapper: jest.fn(),
}));

describe('structure', () => {
  it('contains table surrounded with scroll component', () => {
    const className = 'test-class';
    const children = <div>children</div>;

    render(SettingsTable({ children, className }));

    expect(UdpScrollWrapper).toHaveBeenCalledWith(
      expect.objectContaining({
        gradClassName: 'from-primary-50 w-32',
        children: (
          <Table hoverable className={twMerge('rounded-xl', className)}>
            {children}
          </Table>
        ),
      }),
      undefined,
    );
  });
});
