/* c8 ignore start */
import { mkMetadata } from '@/app/meta';
import { getPublicEnv } from '@/app/_lib/env';

export const generateMetadata = mkMetadata({ pageName: 'Ai Demo' });

export default function AiDemoPage() {
  return (
    <main className='flex h-full flex-col items-center justify-between'>
      <iframe
        title={'aidemo-iframe'}
        className='size-full rounded-xl'
        src={getPublicEnv('AIDEMO_URI')}
      />
    </main>
  );
}
