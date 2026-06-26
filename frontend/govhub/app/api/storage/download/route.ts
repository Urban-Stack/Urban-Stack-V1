import { NextRequest } from 'next/server';
import { unsafeGetDefined } from 'udp-ui/assertion';
import { redirect } from 'next/navigation';
import { mkS3Client } from '@/app/_lib/storage/server';
import { SEARCH_PARAMS } from '@/app/api/storage/download/common';
import { fetchDownloadUrl } from '@/app/api/storage/download/internal';

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const bucket = unsafeGetDefined(searchParams.get(SEARCH_PARAMS.bucket));
  const key = unsafeGetDefined(searchParams.get(SEARCH_PARAMS.key));

  const url = await fetchDownloadUrl(await mkS3Client(), bucket, key);
  redirect(url);
};
