/**
 * @jest-environment node
 */
import { GET } from './route';
import { fetchUploadPost } from './internal';
import { mkS3Client } from '@/app/_lib/storage/server';
import { SEARCH_PARAMS } from './common';
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';

jest.mock('@/app/_lib/storage/server', () => ({
  mkS3Client: jest.fn(),
}));

jest.mock('./internal', () => ({
  fetchUploadPost: jest.fn(),
}));

describe('GET', () => {
  beforeEach(() => {
    (mkS3Client as jest.Mock).mockResolvedValue({});
    (fetchUploadPost as jest.Mock).mockClear();
  });

  const searchParams = new URLSearchParams({
    [SEARCH_PARAMS.bucket]: 'test-bucket',
    [SEARCH_PARAMS.key]: 'test.txt',
    [SEARCH_PARAMS.contentType]: 'text/plain',
  });
  const validReq = new NextRequest(
    `http://localhost?${searchParams.toString()}`,
  );

  it.each([
    [
      SEARCH_PARAMS.bucket,
      {
        [SEARCH_PARAMS.key]: 'test.txt',
        [SEARCH_PARAMS.contentType]: 'text/plain',
      },
    ],
    [
      SEARCH_PARAMS.key,
      {
        [SEARCH_PARAMS.bucket]: 'test-bucket',
        [SEARCH_PARAMS.contentType]: 'text/plain',
      },
    ],
    [
      SEARCH_PARAMS.contentType,
      {
        [SEARCH_PARAMS.bucket]: 'test-bucket',
        [SEARCH_PARAMS.key]: 'test.txt',
      },
    ],
  ])('throws if search param %s is missing', async (_, params) => {
    const searchParams = new URLSearchParams(params);
    const req = new NextRequest(`http://localhost?${searchParams.toString()}`);
    await expect(GET(req)).rejects.toThrow();
  });

  it('throws ZodError if fetchUploadPost returns invalid object', async () => {
    (fetchUploadPost as jest.Mock).mockResolvedValue({
      url: 'some-url',
      fields: undefined, // missing
    });

    await expect(GET(validReq)).rejects.toThrow(ZodError);
  });

  it('returns correct value on success', async () => {
    const mockPost = {
      url: 'http://s3.example.com/test-bucket',
      fields: {
        key: 'test.txt',
        'Content-Type': 'text/plain',
      },
    };
    (fetchUploadPost as jest.Mock).mockResolvedValue(mockPost);

    const response = await GET(validReq);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockPost);
  });
});
