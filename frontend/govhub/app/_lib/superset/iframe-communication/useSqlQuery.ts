import { useEffect, useState } from 'react';
import { Message } from './message';

export const useSqlQuery: (baseUrl: string) => {
  sqlQuery?: string;
} = (baseUrl: string) => {
  const [sqlQuery, setSqlQuery] = useState<string>();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== baseUrl) return;

      const message: Message = event.data as Message;
      if (message._tag === 'SqlQuery') {
        setSqlQuery(message.sql);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [baseUrl]);

  return { sqlQuery };
};
