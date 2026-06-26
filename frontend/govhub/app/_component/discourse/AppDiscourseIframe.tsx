'use client';

import { useDiscourse } from '@/app/_lib/discourse/discourse';
import { UdpSpinner } from 'udp-ui/components';
import { useSearchParams } from 'next/navigation';
import { useIframeReset } from '@/app/_lib/client/iframeResetStorage';

interface AppDiscourseIframeProps {
  discourseBaseUrl: string;
}

const AppDiscourseIframe = ({ discourseBaseUrl }: AppDiscourseIframeProps) => {
  const { useCurrentUser } = useDiscourse(discourseBaseUrl);
  const { isError } = useCurrentUser();
  const isLoggedIn = !isError;

  const searchParams = useSearchParams();
  const mPath = searchParams.get('path');
  const path = mPath ? `/${mPath}` : '';

  const iframeToken = useIframeReset((s) => s.tokens['DISCOURSE'] ?? 0);
  return isLoggedIn ? (
    <iframe
      title={'discourse-iframe'}
      className='size-full rounded-xl'
      src={`${discourseBaseUrl}${path}`}
      key={iframeToken}
    />
  ) : (
    <div className='h-full flex justify-center items-center'>
      <UdpSpinner />
    </div>
  );
};

export default AppDiscourseIframe;
