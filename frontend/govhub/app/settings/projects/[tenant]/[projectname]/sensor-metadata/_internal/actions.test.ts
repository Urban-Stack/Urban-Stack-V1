import { FuncMock } from '@/app/_test/utils';
import { deleteSensorMetadata, requestPresignedUploadUrl } from './actions';
import {
  deleteMetadata,
  getPresignedUploadUrl,
} from '@/app/_lib/sensor-metadata';
import { PresignUpload } from '@/app/_lib/sensor-metadata/schema';

jest.mock('@/app/_lib/sensor-metadata', () => ({
  deleteMetadata: jest.fn(),
  getPresignedUploadUrl: jest.fn(),
}));

const deleteMetadataMock = deleteMetadata as unknown as FuncMock<
  typeof deleteMetadata
>;
const getPresignedUploadUrlMock = getPresignedUploadUrl as unknown as FuncMock<
  typeof getPresignedUploadUrl
>;

const TENANT = 'tenant-1';
const PROJECT = 'project-1';
const ERROR_MESSAGE = 'Ein unbekannter Fehler ist aufgetreten.';

beforeEach(() => {
  deleteMetadataMock.mockReset();
  getPresignedUploadUrlMock.mockReset();
});

describe('deleteSensorMetadata', () => {
  it('returns empty data state when deletion succeeds', async () => {
    deleteMetadataMock.mockResolvedValue(undefined);

    const state = await deleteSensorMetadata(TENANT, PROJECT);

    expect(deleteMetadataMock).toHaveBeenCalledWith(TENANT, PROJECT);
    expect(state).toEqual({ data: {} });
  });

  it('returns general error when deletion throws', async () => {
    deleteMetadataMock.mockRejectedValue(new Error('boom'));

    const state = await deleteSensorMetadata(TENANT, PROJECT);

    expect(deleteMetadataMock).toHaveBeenCalledWith(TENANT, PROJECT);
    expect(state).toEqual({ errors: { general: [ERROR_MESSAGE] } });
  });
});

describe('requestPresignedUploadUrl', () => {
  it('forwards tenant, project to sensor metadata API', async () => {
    const expected: PresignUpload = {
      uploadUrl: 'https://upload',
      expiresAt: 12345,
    };
    getPresignedUploadUrlMock.mockResolvedValue(expected);

    const result = await requestPresignedUploadUrl(TENANT, PROJECT);

    expect(getPresignedUploadUrlMock).toHaveBeenCalledWith(TENANT, PROJECT);
    expect(result).toBe(expected);
  });
});
