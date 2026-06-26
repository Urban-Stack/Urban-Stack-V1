import { ZodError } from 'zod';
import { PresignedPostSchema, fetchUploadUrl, SEARCH_PARAMS } from './common';

describe('PresignedPostSchema', () => {
  it('should throw ZodError for invalid data', () => {
    const invalidData = { url: 'some-url', fields: { key: 123 } };
    expect(() => PresignedPostSchema.parse(invalidData)).toThrow(ZodError);
  });

  it('should return PresignedPost for valid data', () => {
    const validData = {
      url: 'https://s3.example.com/test-bucket',
      fields: {
        key: 'test-file.txt',
        'Content-Type': 'text/plain',
      },
    };
    const result = PresignedPostSchema.parse(validData);
    expect(result).toEqual(validData);
  });
});

describe('fetchUploadUrl', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ url: 'some-url', fields: {} }),
    });
  });

  it('calls fetch with correct parameters when filetype is present', async () => {
    const bucket = 'test-bucket';
    const file = new File(['content'], 'test-file.txt', {
      type: 'text/plain',
    });
    const params = new URLSearchParams({
      [SEARCH_PARAMS.bucket]: bucket,
      [SEARCH_PARAMS.key]: file.name,
      [SEARCH_PARAMS.contentType]: file.type,
    });

    await fetchUploadUrl(bucket, file);

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/storage/upload?${params.toString()}`,
    );
  });

  it('calls fetch with correct parameters when filetype is not present', async () => {
    const bucket = 'test-bucket';
    const file = new File(['content'], 'test-file-no-type');
    const params = new URLSearchParams({
      [SEARCH_PARAMS.bucket]: bucket,
      [SEARCH_PARAMS.key]: file.name,
      [SEARCH_PARAMS.contentType]: 'application/octet-stream',
    });

    await fetchUploadUrl(bucket, file);

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/storage/upload?${params.toString()}`,
    );
  });
});
