import {
  deleteMetadata,
  getMetadata,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
} from './metadata';
import { fetcher, fetcherRaw } from '@/app/_lib/client/fetcher';
import { getPublicEnv } from '@/app/_lib/env';
import { requireAuth } from '@/app/_lib/auth';
import { TEST_SESSION } from '@/app/_test/utils';
import { MetadataSchema, PresignDownload, PresignUpload } from './schema';

jest.mock('@/app/_lib/client/fetcher', () => ({
  fetcher: jest.fn(),
  fetcherRaw: jest.fn(),
}));
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));
jest.mock('@/app/_lib/auth', () => ({
  requireAuth: jest.fn(),
}));

const fetcherMock = fetcher as jest.MockedFunction<typeof fetcher>;
const fetcherRawMock = fetcherRaw as jest.MockedFunction<typeof fetcherRaw>;
const getPublicEnvMock = getPublicEnv as jest.MockedFunction<
  typeof getPublicEnv
>;
const requireAuthMock = requireAuth as jest.MockedFunction<typeof requireAuth>;

const METADATA_URL = 'https://metadata.test';

beforeEach(() => {
  fetcherMock.mockReset();
  fetcherRawMock.mockReset();
  getPublicEnvMock.mockReset();
  requireAuthMock.mockReset();

  getPublicEnvMock.mockReturnValue(METADATA_URL);
  requireAuthMock.mockResolvedValue(TEST_SESSION);
});

const TENANT = 'tenant-a';
const PROJECT = 'project-b';

describe('getMetadata', () => {
  it('returns parsed metadata with auth headers', async () => {
    const expected = { count: 3 };
    const fetcherRequestMock = jest.fn().mockResolvedValue(expected);
    fetcherMock.mockReturnValue(fetcherRequestMock);

    const metadata = await getMetadata(TENANT, PROJECT);

    expect(metadata).toEqual(expected);
    expect(getPublicEnvMock).toHaveBeenCalledWith('SENSOR_METADATA_URI');
    expect(requireAuthMock).toHaveBeenCalledTimes(1);
    expect(fetcherMock).toHaveBeenCalledWith(MetadataSchema);
    expect(fetcherRequestMock).toHaveBeenCalledWith(
      `${METADATA_URL}/api/v1/metadata/${TENANT}/${PROJECT}`,
      {
        headers: {
          Authorization: `Bearer ${TEST_SESSION.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
  });
});

describe('deleteMetadata', () => {
  it('calls fetcherRaw with auth headers', async () => {
    fetcherRawMock.mockResolvedValue({} as Response);

    await deleteMetadata(TENANT, PROJECT);

    expect(getPublicEnvMock).toHaveBeenCalledWith('SENSOR_METADATA_URI');
    expect(requireAuthMock).toHaveBeenCalledTimes(1);
    expect(fetcherRawMock).toHaveBeenCalledWith(
      `${METADATA_URL}/api/v1/metadata/${TENANT}/${PROJECT}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${TEST_SESSION.accessToken}`,
        },
      },
    );
  });
});

describe('getPresignedUploadUrl', () => {
  it('calls fetcher with auth headers', async () => {
    const expected: PresignUpload = {
      uploadUrl: 'https://upload',
      expiresAt: 12345,
    };
    const fetcherRequestMock = jest.fn().mockResolvedValue(expected);
    fetcherMock.mockReturnValue(fetcherRequestMock);

    const presign = await getPresignedUploadUrl(TENANT, PROJECT);

    expect(presign).toEqual(expected);
    expect(fetcherRequestMock).toHaveBeenCalledWith(
      `${METADATA_URL}/api/v1/metadata/${TENANT}/${PROJECT}/presign/upload-token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TEST_SESSION.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
  });
});

describe('getPresignedDownloadUrl', () => {
  it('calls fetcher with auth headers', async () => {
    const expected: PresignDownload = {
      downloadUrl: 'https://download',
      expiresAt: 12345,
    };
    const fetcherRequestMock = jest.fn().mockResolvedValue(expected);
    fetcherMock.mockReturnValue(fetcherRequestMock);

    const presign = await getPresignedDownloadUrl(TENANT, PROJECT);

    expect(presign).toEqual(expected);
    expect(fetcherRequestMock).toHaveBeenCalledWith(
      `${METADATA_URL}/api/v1/metadata/${TENANT}/${PROJECT}/presign/download-token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TEST_SESSION.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
  });
});
