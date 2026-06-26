import { fetchExistsFile } from './common';

global.fetch = jest.fn();

describe('fetchExistsFile', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('returns true if file exists', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ exists: true }),
    });

    const result = await fetchExistsFile('test-bucket', 'test-key');

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      '/api/storage/exists?bucket=test-bucket&key=test-key',
    );
  });

  it('returns false if file does not exist', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ exists: false }),
    });

    const result = await fetchExistsFile('test-bucket', 'test-key');

    expect(result).toBe(false);
    expect(fetch).toHaveBeenCalledWith(
      '/api/storage/exists?bucket=test-bucket&key=test-key',
    );
  });
});
