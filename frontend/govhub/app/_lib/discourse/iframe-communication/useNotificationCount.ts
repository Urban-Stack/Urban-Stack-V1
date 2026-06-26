import { useEffect, useState } from 'react';
import type { Message } from '@/app/_lib/discourse/iframe-communication/message';

export const useNotificationCount: (baseUrl: string) => {
  notificationUnread?: string;
  chatUnread?: string;
} = (baseUrl: string) => {
  const [notificationUnread, setNotificationUnread] = useState<string>();
  const [chatUnread, setChatUnread] = useState<string>();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== baseUrl) return;

      const message: Message = event.data as Message;
      if (message._tag === 'NotificationCount') {
        setNotificationUnread(toString(message.value.notificationUnread));
        setChatUnread(toString(message.value.chatUnread));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [baseUrl]);

  return { notificationUnread, chatUnread };
};

export const toString: (notification: number | string) => string | undefined = (
  notification,
) => {
  if (typeof notification === 'string') return notification;
  else {
    if (notification > 99) return '99+';
    if (notification < 1) return undefined;
    else return notification.toString();
  }
};
