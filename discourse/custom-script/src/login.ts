import { waitForElement } from './observer';
import { LoginComplete } from '#/message';

export const waitForLogin: () => void = waitForElement(
  () => window.parent.postMessage(LoginComplete(), '*'),
  () => document.querySelector('li#current-user'),
);
