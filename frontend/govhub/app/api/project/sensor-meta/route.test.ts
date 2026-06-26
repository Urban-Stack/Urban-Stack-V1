import { GET } from './route';
import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { SEARCH_PARAMS } from './common';
import { getPresignedDownloadUrl } from '@/app/_lib/sensor-metadata';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/app/_lib/sensor-metadata', () => ({
  getPresignedDownloadUrl: jest.fn().mockResolvedValue({
    downloadUrl: 'https://mock-signed-url',
    expiresAt: 123,
  }),
}));

describe('route.ts GET', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mkUrl = () => {
    const url = new URL('http://localhost/api/project/sensor-meta');
    url.searchParams.set(SEARCH_PARAMS.tenant, 'tenant-1');
    url.searchParams.set(SEARCH_PARAMS.project, 'project-1');
    return url;
  };

  it('redirects to the signed download URL', async () => {
    const nextUrl = mkUrl();
    const req = { nextUrl } as unknown as NextRequest;

    await GET(req);

    expect(getPresignedDownloadUrl).toHaveBeenCalledWith(
      'tenant-1',
      'project-1',
    );
    expect(redirect).toHaveBeenCalledWith('https://mock-signed-url');
  });

  it.each(Object.keys(SEARCH_PARAMS))(
    'throws if missing search params',
    async (key) => {
      const nextUrl = mkUrl();
      nextUrl.searchParams.delete(key);
      const req = { nextUrl } as unknown as NextRequest;

      await expect(GET(req)).rejects.toThrow();
      expect(redirect).not.toHaveBeenCalled();
    },
  );
});
