import 'next-auth';
// noinspection ES6UnusedImports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name?: string;
    };
    error?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    userId: string;
    expiresAt: number;
    error?: boolean;
  }
}
