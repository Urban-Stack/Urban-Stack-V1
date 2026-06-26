import HelpDeskForm from '@/app/helpdesk/HelpDeskForm';
import { mkMetadata } from '@/app/meta';

export const generateMetadata = mkMetadata({ pageName: 'Helpdesk' });

const HelpDeskPage = () => (
  <main className='flex h-full flex-col items-center'>
    <div className='flex w-full justify-between mb-4'>
      <h1 className='text-3xl font-bold text-gray-900'>Helpdesk</h1>
    </div>
    <div className='size-full flex flex-col gap-5 rounded-xl overflow-hidden bg-white p-6'>
      <HelpDeskForm />
    </div>
  </main>
);

export default HelpDeskPage;
