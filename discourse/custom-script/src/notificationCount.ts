import { eq, type Message, NotificationCount } from '#/message';
import { monitorElement } from '@/observer';

const postMessage = (msg?: Message) => {
  if (msg) {
    window.parent.postMessage(msg, '*');
  }
};

const parseCount: (elem: Element) => number | string = (elem) => {
  const maybeNum = parseInt(elem.textContent ?? '0', 10);
  if (isNaN(maybeNum)) return elem.textContent ?? 0;
  else return maybeNum;
};

const queryChatUnread: () => Element | null = () =>
  document.querySelector('a[title="Chat"]');

const queryNotificationUnread: () => Element | null = () =>
  document.querySelector('li#current-user');

const queryNotificationCount: () => Message = () => {
  const chatUnreadElement = queryChatUnread()?.querySelector(
    '.chat-channel-unread-indicator__number',
  );
  const notificationUnreadElement = queryNotificationUnread()?.querySelector(
    'a.unread-notifications',
  );

  const chatUnread = chatUnreadElement ? parseCount(chatUnreadElement) : 0;
  const notificationUnread = notificationUnreadElement
    ? parseCount(notificationUnreadElement)
    : 0;

  return NotificationCount({ chatUnread, notificationUnread });
};

export const monitorChatUnread: () => void = monitorElement(
  postMessage,
  queryChatUnread,
  queryNotificationCount,
  eq,
);

export const monitorNotificationUnread: () => void = monitorElement(
  postMessage,
  queryNotificationUnread,
  queryNotificationCount,
  eq,
);
