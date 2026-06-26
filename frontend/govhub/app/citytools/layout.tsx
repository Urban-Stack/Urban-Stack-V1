import { ReactNode } from 'react';

const CitytoolLayout = ({ children }: { children: ReactNode }) => (
  <main className='h-full flex flex-col gap-y-4'>
    <div className='w-full'>
      <h1 className='text-3xl font-bold text-gray-900'>City Tools</h1>
    </div>
    {children}
  </main>
);
export default CitytoolLayout;
