/* c8 ignore start */
'use client';

import { useDiscourseStore } from '@/app/_store/discourseStore';
import { useEffect } from 'react';
import { Message } from './_lib/discourse/iframe-communication/message';

interface AppIframeLoginProps {
  discourseBaseUrl: string;
}

/**
 * This component uses an iframe to log in to Discourse and obtains a session cookie.
 * @param discourseBaseUrl The base URL of the Discourse server.
 */
const AppDiscourseLogin = ({ discourseBaseUrl }: AppIframeLoginProps) => {
  const setIsLoggedIn = useDiscourseStore((s) => s.setIsLoggedIn);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== discourseBaseUrl) return; // origin check

      const msg = event.data as Message;
      if (msg?._tag === 'LoginComplete') {
        setIsLoggedIn(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [discourseBaseUrl, setIsLoggedIn]);

  return (
    <iframe
      inert={true}
      title='discourse-login-iframe'
      id='discourse-login-iframe'
      src={`${discourseBaseUrl}?mobile_view=0`}
      height='0'
      width='0'
      className={'invisible'}
    />
  );
};

export default AppDiscourseLogin;
