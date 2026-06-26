/**
 * @jest-environment node
 */
import { GET } from './route';
import { NextRequest } from 'next/server';

import { query } from '@/app/_lib/resource-api/client';
import {
  ContainerInfo,
  toContainerInfo,
} from '@/app/_lib/resource-api/common/containerinfo';
import { internal as sharedAppsInternal } from '@/app/_lib/resource-api/graphql/sharedApps';
import { mkError } from '@/app/api/_common/containerinfo';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/common/containerinfo', () => ({
  toContainerInfo: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/sharedApps', () => ({
  internal: { GET_CONTAINER_INFOS: 'GET_CONTAINER_INFOS_DOC' },
}));

const queryMock = query as jest.Mock;
const toContainerInfoMock = toContainerInfo as jest.MockedFunction<
  typeof toContainerInfo
>;

describe('GET', () => {
  const mkUrl = (params: Record<string, string | undefined>) => {
    const url = new URL('http://localhost/api/sharedapp/containerinfo');
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, v);
    });
    return url;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [{ tenant: 'guetersloh', name: undefined }],
    [{ tenant: undefined, name: 'app' }],
  ])('returns 400 if required params missing: %p', async (params) => {
    const req = { nextUrl: mkUrl(params) } as unknown as NextRequest;
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Missing required params: tenant, name' });
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('parses lines param (positive number -> floored)', async () => {
    const req = {
      nextUrl: mkUrl({ tenant: 'guetersloh', name: 'app', lines: '12.7' }),
    } as unknown as NextRequest;

    const fakeResult = { data: {} };
    queryMock.mockResolvedValue(fakeResult);
    toContainerInfoMock.mockReturnValue({
      name: 'app',
      logs: '',
      ready: true,
      status: 'running',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        query: sharedAppsInternal.GET_CONTAINER_INFOS,
        variables: { tenant: 'guetersloh', name: 'app', lines: 12 },
        fetchPolicy: 'network-only',
      }),
    );
  });

  it('defaults lines to 1000 on invalid input', async () => {
    const req = {
      nextUrl: mkUrl({ tenant: 'guetersloh', name: 'app', lines: 'abc' }),
    } as unknown as NextRequest;

    const fakeResult = { data: {} };
    queryMock.mockResolvedValue(fakeResult);
    toContainerInfoMock.mockReturnValue({
      name: 'app',
      logs: '',
      ready: true,
      status: 'running',
    });

    await GET(req);

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ lines: 1000 }),
      }),
    );
  });

  it('returns 500 when toContainerInfo yields undefined', async () => {
    const req = {
      nextUrl: mkUrl({ tenant: 'guetersloh', name: 'app' }),
    } as unknown as NextRequest;

    const fakeResult = { data: { sharedApp: null } };
    queryMock.mockResolvedValue(fakeResult);
    toContainerInfoMock.mockReturnValue(undefined);

    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body).toEqual(mkError('internal_error'));
  });

  it('returns 500 on query error', async () => {
    const req = {
      nextUrl: mkUrl({ tenant: 'guetersloh', name: 'app' }),
    } as unknown as NextRequest;

    queryMock.mockRejectedValue(new Error('boom'));

    const res = await GET(req);

    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body).toEqual(mkError('internal_error'));
  });

  it('returns containerInfo on success with no-store header', async () => {
    const req = {
      nextUrl: mkUrl({ tenant: 't', name: 'app' }),
    } as unknown as NextRequest;

    const fakeResult = { data: {} };
    const containerInfo = {
      name: 'app',
      logs: 'ok',
      ready: true,
      status: 'running',
    } satisfies ContainerInfo;
    queryMock.mockResolvedValue(fakeResult);
    toContainerInfoMock.mockReturnValue(containerInfo);

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(body.containerInfo).toEqual(containerInfo);
    expect(typeof body.updatedAt).toBe('string');
    expect(toContainerInfoMock).toHaveBeenCalledWith(fakeResult);
  });
});
