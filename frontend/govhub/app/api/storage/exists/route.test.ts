/**
 * @jest-environment node
 */
import { GET } from './route';
import { mkS3Client } from '@/app/_lib/storage/server';
import { SEARCH_PARAMS } from '@/app/api/storage/download/common';
import { NextRequest } from 'next/server';

jest.mock('@/app/_lib/storage/server', () => ({
  mkS3Client: jest.fn(),
}));

describe('GET', () => {
  const mockHeadObject = jest.fn();

  beforeEach(() => {
    (mkS3Client as jest.Mock).mockResolvedValue({
      headObject: mockHeadObject,
    });
    mockHeadObject.mockClear();
  });

  const mkUrl = () => {
    const url = new URL('http://localhost/api/storage/exists');
    url.searchParams.set(SEARCH_PARAMS.bucket, 'test-bucket');
    url.searchParams.set(SEARCH_PARAMS.key, 'test.txt');
    return url;
  };

  it.each(Object.keys(SEARCH_PARAMS))(
    'throws if missing search params',
    async (key) => {
      const nextUrl = mkUrl();
      nextUrl.searchParams.delete(key);
      const req = { nextUrl } as unknown as NextRequest;

      await expect(GET(req)).rejects.toThrow();
    },
  );

  it('returns true if file exists', async () => {
    mockHeadObject.mockResolvedValue({});
    const nextUrl = mkUrl();
    const req = { nextUrl } as unknown as NextRequest;

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ exists: true });
    expect(mockHeadObject).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: 'test.txt',
    });
  });

  it('returns false if file does not exist', async () => {
    const notFoundError = new Error('Not Found');
    notFoundError.name = 'NotFound';
    mockHeadObject.mockRejectedValue(notFoundError);
    const nextUrl = mkUrl();
    const req = { nextUrl } as unknown as NextRequest;

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ exists: false });
    expect(mockHeadObject).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: 'test.txt',
    });
  });
});
