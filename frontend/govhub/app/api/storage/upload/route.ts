import { NextRequest, NextResponse } from 'next/server';
import { unsafeGetDefined } from 'udp-ui/assertion';
import { PresignedPostSchema, SEARCH_PARAMS } from './common';
import { fetchUploadPost } from './internal';
import { mkS3Client } from '@/app/_lib/storage/server';

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;

  const bucket = unsafeGetDefined(searchParams.get(SEARCH_PARAMS.bucket));
  const key = unsafeGetDefined(searchParams.get(SEARCH_PARAMS.key));
  const contentType = unsafeGetDefined(
    searchParams.get(SEARCH_PARAMS.contentType),
  );

  const post = await fetchUploadPost(
    await mkS3Client(),
    bucket,
    key,
    contentType,
  ).then(PresignedPostSchema.parse.bind(null));

  return NextResponse.json(post);
};
