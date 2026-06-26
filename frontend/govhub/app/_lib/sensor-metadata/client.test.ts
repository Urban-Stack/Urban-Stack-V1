import { uploadSensorMetadata } from './client';
import { Writable } from 'ts-essentials';

const mockXHR = {
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  upload: {} as XMLHttpRequestUpload,
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  status: 200,
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
  mockXHR.status = 200;
});

const fileBits = ['sensor_id\n1\n'];

describe('uploadSensorMetadata', () => {
  const file = new File(fileBits, 'metadata.csv', { type: 'text/csv' });
  const uploadUrl = 'https://example.com/upload';
  const onProgress = jest.fn();

  it('opens PUT request with upload URL', async () => {
    const promise = uploadSensorMetadata(file, uploadUrl, onProgress);
    mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);
    await promise;

    expect(mockXHR.open).toHaveBeenCalledWith(
      'PUT',
      'https://example.com/upload',
      true,
    );
  });

  it('falls back to csv content type when file type is missing', async () => {
    const fileWithoutType = new File(fileBits, 'metadata.csv');
    const promise = uploadSensorMetadata(
      fileWithoutType,
      uploadUrl,
      onProgress,
    );
    mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);
    await promise;

    expect(mockXHR.setRequestHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv',
    );
  });

  it('resolves on successful upload', async () => {
    const onProgress = jest.fn();
    const promise = uploadSensorMetadata(file, uploadUrl, onProgress);
    mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);
    await expect(promise).resolves.toBeUndefined();
  });

  it('reports progress as upload advances', async () => {
    const onProgress = jest.fn();
    const promise = uploadSensorMetadata(file, uploadUrl, onProgress);

    const progressEvent = {
      lengthComputable: true,
      loaded: 25,
      total: 50,
    } as unknown as ProgressEvent<EventTarget>;
    mockXHR.upload.onprogress?.call(mockXHR, progressEvent);

    expect(onProgress).toHaveBeenCalledWith(50);

    mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);
    await promise;
  });

  it('rejects with unsupported media type error', async () => {
    mockXHR.status = 415;

    const promise = uploadSensorMetadata(file, uploadUrl, onProgress);
    mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);

    await expect(promise).rejects.toThrow('Nur CSV Dateien werden unterstützt');
  });

  it('rejects with unprocessable content error', async () => {
    mockXHR.status = 422;

    const promise = uploadSensorMetadata(file, uploadUrl, onProgress);
    mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);

    await expect(promise).rejects.toThrow(
      'CSV Inhalt entspricht nicht gefordertem Format',
    );
  });

  it('rejects with generic error for other statuses', async () => {
    mockXHR.status = 500;

    const promise = uploadSensorMetadata(file, uploadUrl, onProgress);
    mockXHR.onload?.({} as ProgressEvent<XMLHttpRequest>);

    await expect(promise).rejects.toThrow('Upload fehlgeschlagen (status 500)');
  });

  it('rejects on network error', async () => {
    const promise = uploadSensorMetadata(file, uploadUrl, onProgress);
    mockXHR.onerror?.({} as ProgressEvent<XMLHttpRequest>);

    await expect(promise).rejects.toThrow('Unbekannter Fehler');
  });
});
