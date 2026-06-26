import { SEARCH_PARAMS } from '@/app/api/storage/download/common';
import { NextRequest, NextResponse } from 'next/server';
import { unsafeGetDefined } from 'udp-ui/assertion';
import { mkS3Client } from '@/app/_lib/storage/server';

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const bucket = unsafeGetDefined(searchParams.get(SEARCH_PARAMS.bucket));
  const key = unsafeGetDefined(searchParams.get(SEARCH_PARAMS.key));

  const client = await mkS3Client();
  const exists = await client
    .headObject({ Bucket: bucket, Key: key })
    .then(() => true)
    .catch((e) => {
      if (isNotFoundError(e)) return false;
      else throw e;
    });

  return NextResponse.json({ exists });
};

const isNotFoundError = (e: unknown): e is { name: 'NotFound' } =>
  typeof e === 'object' &&
  e !== null &&
  'name' in e &&
  e['name'] === 'NotFound';
