import { deleteObject, fetchObjects, mkS3Client } from './s3client';
import { S3, S3ServiceException } from '@aws-sdk/client-s3';
import { toS3Objects } from '@/app/_lib/storage/common';
import { left, right } from 'udp-ui/fp';
import type { __ServiceExceptionOptions } from '@aws-sdk/client-s3/dist-types/models/S3ServiceException';

jest.mock('@aws-sdk/client-sts', () => ({
  STS: jest.fn().mockImplementation(() => ({
    assumeRoleWithWebIdentity: jest.fn().mockResolvedValue({
      Credentials: {
        AccessKeyId: 'test-key-id',
        SecretAccessKey: 'test-secret',
        SessionToken: 'test-token',
      },
    }),
  })),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  ...jest.requireActual('@aws-sdk/client-s3'),
  S3: jest.fn().mockImplementation(() => ({
    listObjects: jest.fn().mockResolvedValue({
      Contents: [{ Key: 'obj1' }, { Key: 'obj2' }],
    }),
    deleteObject: jest.fn().mockResolvedValue({
      $metadata: { httpStatusCode: 204 },
    }),
  })),
}));

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn().mockReturnValue('https://storage.data-hub.local'),
}));

jest.mock('@/auth', () => ({
  authWithRefresh: jest.fn().mockResolvedValue({
    idToken: 'someIdToken',
  }),
}));

jest.mock('@/app/_lib/storage/common', () => ({
  toS3Objects: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

it('creates an S3 client with assumed credentials', async () => {
  await mkS3Client();
  expect(S3).toHaveBeenCalledWith(
    expect.objectContaining({
      region: 'none',
      forcePathStyle: true,
      endpoint: 'https://storage.data-hub.local',
      credentials: expect.objectContaining({
        accessKeyId: 'test-key-id',
        secretAccessKey: 'test-secret',
        sessionToken: 'test-token',
      }),
    }),
  );
});

describe('fetchObjects', () => {
  it('returns an Unknown error on generic error', async () => {
    const e = new Error('Network error');
    const listObjects = jest.fn().mockImplementation(() => Promise.reject(e));
    const mockClient = { listObjects } as unknown as S3;

    const result = await fetchObjects('test-bucket', mockClient);

    expect(result).toEqual(left({ name: 'Unknown', e }));
  });

  it('returns an Unknown error on generic S3ServiceException', async () => {
    const e = new S3ServiceException({
      name: 'S3 Error',
    } as unknown as __ServiceExceptionOptions);
    const listObjects = jest.fn().mockImplementation(() => Promise.reject(e));
    const mockClient = { listObjects } as unknown as S3;

    const result = await fetchObjects('test-bucket', mockClient);

    expect(result).toEqual(left({ name: 'Unknown', e }));
  });

  it('returns an AccessDenied error on AccessDenied S3ServiceException', async () => {
    const e = new S3ServiceException({
      name: 'AccessDenied',
    } as unknown as __ServiceExceptionOptions);
    const listObjects = jest.fn().mockImplementation(() => Promise.reject(e));
    const mockClient = { listObjects } as unknown as S3;

    const result = await fetchObjects('test-bucket', mockClient);

    expect(result).toEqual(left({ name: 'AccessDenied', e }));
  });

  it('returns a list of objects from the S3 bucket', async () => {
    const listObjects = jest
      .fn()
      .mockImplementation(({ Bucket }: { Bucket: string }) => {
        if (Bucket == 'test-bucket') return Promise.resolve('response');
        else throw new Error('Bucket not found');
      });
    (toS3Objects as jest.Mock).mockImplementation((o: string) => {
      if (o === 'response') return ['obj1', 'obj2'];
      else throw new Error('Invalid response');
    });
    const mockClient = { listObjects } as unknown as S3;

    const objects = await fetchObjects('test-bucket', mockClient);

    expect(objects).toEqual(right(['obj1', 'obj2']));
  });
});

describe('deleteObject', () => {
  it('returns true when deleteObject returns 204', async () => {
    const result = await deleteObject('test-bucket', 'test-key');
    expect(result).toBe(true);
  });

  it('returns false when deleteObject is not 204', async () => {
    const mockClient = {
      deleteObject: jest.fn().mockResolvedValue({
        $metadata: { httpStatusCode: 400 },
      }),
    } as unknown as S3;

    const result = await deleteObject('test-bucket', 'test-key', mockClient);

    expect(result).toBe(false);
  });

  it('returns false when deleteObject throws an exception', async () => {
    const mockClient = {
      deleteObject: jest.fn().mockRejectedValue(new Error('some error')),
    } as unknown as S3;

    const result = await deleteObject('test-bucket', 'test-key', mockClient);

    expect(result).toBe(false);
  });
});
