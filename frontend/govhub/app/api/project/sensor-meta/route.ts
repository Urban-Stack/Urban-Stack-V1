import { NextRequest } from 'next/server';
import { unsafeGetDefined } from 'udp-ui/assertion';
import { redirect } from 'next/navigation';
import { SEARCH_PARAMS } from '@/app/api/project/sensor-meta/common';
import { getPresignedDownloadUrl } from '@/app/_lib/sensor-metadata';

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const tenant = unsafeGetDefined(searchParams.get(SEARCH_PARAMS.tenant));
  const project = unsafeGetDefined(searchParams.get(SEARCH_PARAMS.project));

  const url = await getPresignedDownloadUrl(tenant, project);
  redirect(url.downloadUrl);
};
