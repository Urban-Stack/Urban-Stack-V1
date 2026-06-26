import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { internal as sharedAppsInternal } from '@/app/_lib/resource-api/graphql/sharedApps';
import { query } from '@/app/_lib/resource-api/client';
import {
  ContainerInfoResponseBody,
  mkError,
  mkSuccess,
} from '@/app/api/_common/containerinfo';
import { toContainerInfo } from '@/app/_lib/resource-api/common/containerinfo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const tenant = searchParams.get('tenant') ?? undefined;
  const name = searchParams.get('name') ?? undefined;
  const linesRaw = searchParams.get('lines');

  if (!tenant || !name) {
    return NextResponse.json(
      { error: 'Missing required params: tenant, name' },
      { status: 400 },
    );
  }

  const lines =
    Number.isFinite(Number(linesRaw)) && Number(linesRaw) > 0
      ? Math.floor(Number(linesRaw))
      : 1000;

  try {
    const result = await query({
      query: sharedAppsInternal.GET_CONTAINER_INFOS,
      variables: { tenant, name, lines },
      fetchPolicy: 'network-only',
    });

    const containerInfo = toContainerInfo(result);
    if (!containerInfo) {
      console.error('containerinfo response is empty:', result);
      return NextResponse.json<ContainerInfoResponseBody>(
        mkError('internal_error'),
        { status: 500 },
      );
    }

    return NextResponse.json<ContainerInfoResponseBody>(
      mkSuccess(containerInfo),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    console.error('containerinfo route error:', e);
    return NextResponse.json<ContainerInfoResponseBody>(
      mkError('internal_error'),
      { status: 500 },
    );
  }
};
