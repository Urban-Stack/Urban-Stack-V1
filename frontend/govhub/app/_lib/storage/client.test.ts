import { uploadWithProgress } from './client';
import { Writable } from 'ts-essentials';

const mockXHR = {
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  upload: {},
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  status: 204,
} as unknown as Writable<XMLHttpRequest>;

beforeAll(() => {
  global.XMLHttpRequest = jest.fn(
    () => mockXHR,
  ) as unknown as typeof XMLHttpRequest;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockXHR.onload = null;
  mockXHR.onerror = null;
  mockXHR.upload = {} as XMLHttpRequestUpload;
  mockXHR.status = 204;
});

describe('uploadWithProgress', () => {
  const file = new File(['content'], 'test.txt', { type: 'text/plain' });
  const presigned = {
    url: 'https://example.com/upload',
    fields: { key: 'value', policy: 'abc123' },
  };
  const onProgress = jest.fn();

  it('opens POST request with correct URL', async () => {
    const promise = uploadWithProgress(file, presigned, onProgress);
    mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);
    await promise;

    expect(mockXHR.open).toHaveBeenCalledWith(
      'POST',
      'https://example.com/upload',
      true,
    );
  });

  it('sends FormData with presigned fields and file', async () => {
    const promise = uploadWithProgress(file, presigned, onProgress);
    mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);
    await promise;

    expect(mockXHR.send).toHaveBeenCalledWith(expect.any(FormData));
    const formData = (mockXHR.send as jest.Mock).mock.calls[0][0] as FormData;
    expect(formData.get('key')).toBe('value');
    expect(formData.get('policy')).toBe('abc123');
    expect(formData.get('file')).toBe(file);
  });

  it.each([204, 201])('resolves when status is %d', async (status) => {
    mockXHR.status = status;
    const promise = uploadWithProgress(file, presigned, onProgress);
    mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);
    await expect(promise).resolves.toBeUndefined();
  });

  it('rejects when status is invalid', async () => {
    mockXHR.status = 400;
    const promise = uploadWithProgress(file, presigned, onProgress);
    mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);
    await expect(promise).rejects.toThrow('Upload failed (status 400)');
  });

  it('rejects on network error', async () => {
    const promise = uploadWithProgress(file, presigned, onProgress);
    mockXHR.onerror?.({} as ProgressEvent<XMLHttpRequest>);
    await expect(promise).rejects.toThrow('Network error during upload');
  });

  describe('updates progress', () => {
    it('calls onProgress with correct percentage', async () => {
      const promise = uploadWithProgress(file, presigned, onProgress);

      const progressEvent = {
        lengthComputable: true,
        loaded: 50,
        total: 100,
      } as unknown as ProgressEvent<EventTarget>;
      mockXHR.upload.onprogress?.call(mockXHR, progressEvent);

      expect(onProgress).toHaveBeenCalledWith(50);

      mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);
      await promise;
    });

    it('does not call onProgress when lengthComputable is false', async () => {
      const promise = uploadWithProgress(file, presigned, onProgress);

      const progressEvent = {
        lengthComputable: false,
        loaded: 50,
        total: 100,
      } as unknown as ProgressEvent<EventTarget>;
      mockXHR.upload.onprogress?.call(mockXHR, progressEvent);

      expect(onProgress).not.toHaveBeenCalled();

      mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);
      await promise;
    });

    it('rounds progress percentage correctly', async () => {
      const promise = uploadWithProgress(file, presigned, onProgress);

      const progressEvent = {
        lengthComputable: true,
        loaded: 33,
        total: 100,
      } as unknown as ProgressEvent<EventTarget>;
      mockXHR.upload.onprogress?.call(mockXHR, progressEvent);

      expect(onProgress).toHaveBeenCalledWith(33);

      mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);
      await promise;
    });
  });
});
