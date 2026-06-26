export type Message = NotificationCount | LoginComplete;

interface NotificationCount {
  readonly _tag: 'NotificationCount';
  readonly value: {
    readonly chatUnread: Count;
    readonly notificationUnread: Count;
  };
}

interface LoginComplete {
  readonly _tag: 'LoginComplete';
}

type Count = number | string;

export const NotificationCount: (
  value: NotificationCount['value'],
) => Message = (value) => ({
  _tag: 'NotificationCount',
  value,
});

export const LoginComplete: () => Message = () => ({
  _tag: 'LoginComplete',
});

export const eq: (m1: Message, m2: Message) => boolean = (m1, m2) => {
  if (m1._tag !== m2._tag) return false;
  switch (m1._tag) {
    case 'NotificationCount':
      if (m2._tag != 'NotificationCount') return false;
      if (m1.value.chatUnread !== m2.value.chatUnread) return false;
      return m1.value.notificationUnread === m2.value.notificationUnread;
    case 'LoginComplete':
      return true;
  }
};
