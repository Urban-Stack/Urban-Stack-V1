import { GET } from './route';
import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { mkS3Client } from '@/app/_lib/storage/internal/s3client';
import { SEARCH_PARAMS } from './common';
import { fetchDownloadUrl } from './internal';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/app/_lib/storage/internal/s3client', () => ({
  mkS3Client: jest.fn().mockResolvedValue({}),
}));

jest.mock('./internal', () => ({
  fetchDownloadUrl: jest.fn().mockResolvedValue('https://mock-signed-url'),
}));

describe('route.ts GET', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mkUrl = () => {
    const url = new URL('http://localhost/api/storage/download');
    url.searchParams.set(SEARCH_PARAMS.bucket, 'myBucket');
    url.searchParams.set(SEARCH_PARAMS.key, 'someFile.csv');
    return url;
  };

  it('redirects to the signed download URL', async () => {
    const nextUrl = mkUrl();
    const req = { nextUrl } as unknown as NextRequest;

    await GET(req);

    expect(mkS3Client).toHaveBeenCalled();
    expect(fetchDownloadUrl).toHaveBeenCalledWith(
      expect.any(Object),
      'myBucket',
      'someFile.csv',
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
