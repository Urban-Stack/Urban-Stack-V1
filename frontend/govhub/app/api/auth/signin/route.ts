import { signIn } from '@/auth';

/** Always uses the keycloak provider to sign in */
export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const callbackUrl = url.searchParams.get('callbackUrl') ?? '/';

  await signIn('keycloak', { redirectTo: callbackUrl });
};
