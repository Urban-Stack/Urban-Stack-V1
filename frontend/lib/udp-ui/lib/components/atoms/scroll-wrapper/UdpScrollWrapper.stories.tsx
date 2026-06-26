import { Meta, StoryObj } from '@storybook/react';
import UdpScrollWrapper from '@/lib/components/atoms/scroll-wrapper/UdpScrollWrapper.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import { UdpTabs } from '@/lib/components';

const meta = {
  title: 'Atoms/UdpScrollWrapper',
  component: UdpScrollWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpScrollWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'w-[500px]',
    children: (
      <p className='min-w-max h-16 px-4 py-2 whitespace-nowrap bg-primary-500 text-white'>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
        amet.
      </p>
    ),
  },
};

export const CustomGradients: Story = {
  args: {
    ...Default.args,
    gradClassName: 'w-1/3 from-black opacity-50',
  },
};

const USERS = [
  {
    id: 1,
    name: 'User One',
    email: 'user.one@example.com',
    role: 'Admin',
  },
  {
    id: 2,
    name: 'User Two',
    email: 'user.two@example.com',
    role: 'Editor',
  },
  {
    id: 3,
    name: 'User Three',
    email: 'user.three@example.com',
    role: 'Viewer',
  },
];

export const ScrollableTable: Story = {
  args: {
    ...Default.args,
    children: (
      <Table hoverable>
        <TableHead className='[&>*]:bg-gray-700 text-white'>
          <TableHeadCell>ID</TableHeadCell>
          <TableHeadCell>Name</TableHeadCell>
          <TableHeadCell>Email</TableHeadCell>
          <TableHeadCell>Role</TableHeadCell>
          <TableHeadCell>
            <span className='sr-only'>Edit</span>
          </TableHeadCell>
        </TableHead>
        <TableBody className='divide-y'>
          {USERS.map((user) => (
            <TableRow key={user.id} className='whitespace-nowrap bg-gray-100'>
              <TableCell>{user.id}</TableCell>
              <TableCell className='text-gray-900'>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <a
                  href='#'
                  className='text-primary-500 hover:underline'
                  onClick={(e) => e.preventDefault()}
                >
                  Link
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ),
  },
};

const mkTabsData = (labels: string[]) => {
  return Object.fromEntries(
    labels.map((label, idx) => [label, 'subpage/' + idx]),
  );
};

export const ScrollableTabs: Story = {
  args: {
    ...Default.args,
    gradClassName: 'from-gray-100',
    children: (
      <UdpTabs
        tabsData={mkTabsData([
          'Lorem ipsum',
          'dolor sit amet',
          'consetetur sadipscing elitr',
          'sed diam nonumy eirmod tempor invidunt ut labore',
          'et dolore magna aliquyam erat',
        ])}
        activeLabel='dolor sit amet'
      ></UdpTabs>
    ),
  },
};
