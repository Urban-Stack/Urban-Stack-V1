import 'server-only';

import { auth } from '@/auth';
import { assertDefined } from 'udp-ui/assertion';
import { Session } from 'next-auth';

export const requireAuth: () => Promise<Session> = async () => {
  const mSession = await auth();
  assertDefined(mSession, 'Session data is not defined but is required.');
  return mSession;
};
