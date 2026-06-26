'use client';

import { useRouter } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { HelpDeskFallbackIcon, UdpFallback } from 'udp-ui/components';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({ error }: ErrorProps) => {
  const router = useRouter();

  if (isRedirectError(error)) {
    router.push('/api/auth/signin');
  }

  return (
    <main className='flex h-full items-center justify-center'>
      <UdpFallback
        icon={HelpDeskFallbackIcon}
        title='Ein unerwarteter Fehler trat auf.'
        description='Bitte kontaktieren Sie den Helpdesk.'
      />
    </main>
  );
};

export default ErrorPage;
