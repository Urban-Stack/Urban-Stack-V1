import { eq, Message, NotificationCount } from './message';

describe('eq', () => {
  it('returns true if equal', () => {
    expect(
      eq(
        NotificationCount({ chatUnread: 1, notificationUnread: 1 }),
        NotificationCount({ chatUnread: 1, notificationUnread: 1 }),
      ),
    ).toBeTruthy();
  });

  it('returns false if tag is not equal', () => {
    expect(
      eq(
        { _tag: 'Bla', value: 1 } as unknown as Message,
        NotificationCount({ chatUnread: 1, notificationUnread: 2 }),
      ),
    ).toBeFalsy();
  });

  it('returns false if tag equal but chatUnread not equal', () => {
    expect(
      eq(
        NotificationCount({ chatUnread: 1, notificationUnread: 1 }),
        NotificationCount({ chatUnread: 2, notificationUnread: 1 }),
      ),
    ).toBeFalsy();
  });

  it('returns false if tag equal but notificationUnread not equal', () => {
    expect(
      eq(
        NotificationCount({ chatUnread: 1, notificationUnread: 1 }),
        NotificationCount({ chatUnread: 1, notificationUnread: 2 }),
      ),
    ).toBeFalsy();
  });
});
