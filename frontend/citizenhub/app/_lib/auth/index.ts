import 'server-only';

import { auth } from '@/auth';
import { Session } from 'next-auth';

export const getServerSession: () => Promise<Session | null> = async () =>
  auth();
