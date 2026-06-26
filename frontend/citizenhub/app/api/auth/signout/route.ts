import { handlers, signOut } from '@/auth'; // Referring to the auth.ts we just created
export const { POST } = handlers;

/** Redirect to Sign In page to avoid login loop */
export const GET = async () => {
  await signOut({ redirectTo: '/' });
};
