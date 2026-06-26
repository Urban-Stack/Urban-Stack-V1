import Link from 'next/link';
import { IcAngleLeft } from 'udp-ui/components';

const BackNavigation = ({ href }: { href: string }) => (
  <Link
    href={href}
    className='flex gap-2 items-center text-gray-600 hover:underline'
  >
    <IcAngleLeft className='size-4' />
    <span className='text-sm'>Zurück zur Übersicht</span>
  </Link>
);

export default BackNavigation;
