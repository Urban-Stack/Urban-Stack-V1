import { waitForLogin } from './login';
import {
  monitorChatUnread,
  monitorNotificationUnread,
} from '@/notificationCount';

function redirectToGovhubIframe() {
  // if not in iframe and not in playwright (for screenshots)
  if (
    window.self === window.top &&
    !Object.keys(window).some((k) => k.includes('playwright'))
  ) {
    const govhubOrigin = window.location.origin.replace(
      'https://community.',
      'https://govhub.',
    );
    const newUrl = new URL(`${govhubOrigin}/community`);
    const loc = window.location.toString();
    const pathStart = loc.indexOf('/', 8);
    // we want to keep everything except host at the beginning
    let path;
    if (pathStart === -1) {
      path = '/';
    } else {
      path = loc.slice(pathStart);
    }
    newUrl.searchParams.set('path', path);
    window.open(newUrl.toString(), '_self');
  }
}

export default {
  name: 'iframe-communication',
  initialize() {
    console.log('initializing iframe-communicator');
    monitorChatUnread();
    monitorNotificationUnread();
    waitForLogin();
    redirectToGovhubIframe();
  },
};
