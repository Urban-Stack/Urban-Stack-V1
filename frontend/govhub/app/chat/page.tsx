import AppDiscourseIframe from '@/app/_component/discourse/AppDiscourseIframe';
import { getPublicEnv } from '@/app/_lib/env';
import { mkMetadata } from '@/app/meta';

export const generateMetadata = mkMetadata({ pageName: 'Chat' });

const ChatPage = () => (
  <main className='flex h-full flex-col items-center justify-between'>
    <AppDiscourseIframe discourseBaseUrl={getPublicEnv('DISCOURSE_URI')} />
  </main>
);

export default ChatPage;
