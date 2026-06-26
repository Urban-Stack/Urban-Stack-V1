/* c8 ignore start */
import { NextRequest, NextResponse } from 'next/server';

/**
 * Dummy POST endpoint for helpdesk messages
 * TODO: Please REMOVE after implementing the real endpoint
 */
export const POST = async (req: NextRequest) => {
  const payload = (await req.json()) as unknown;
  return NextResponse.json({ received: payload });
};
