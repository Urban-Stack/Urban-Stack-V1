import { z, ZodError } from 'zod';
import {
  asyncMkParsedResponse,
  fetcher,
  fetcherRaw,
  FetchError,
  logMessage,
  PartialResponse,
} from '@/app/_lib/client/fetcher';
import { redirect } from 'next/navigation';
import { FuncMock, mkFetchError } from '@/app/_test/utils';

const EXAMPLE_URL = 'https://example.com';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

afterEach(() => {
  jest.restoreAllMocks();
});

const mockedFetch = jest.fn();
const mockConsoleError = jest.fn();
const mockRedirect = redirect as unknown as FuncMock<typeof redirect>;

beforeAll(() => {
  global.fetch = mockedFetch;
  console.error = mockConsoleError;
});

beforeEach(() => {
  mockedFetch.mockReset();
  mockConsoleError.mockReset();
  mockRedirect.mockReset();
});

describe('fetcher', () => {
  const zType = z.object({ data: z.string() });

  it('successfully parses response to zod type', async () => {
    const response = { data: 'Hello, world!' };

    mockedFetch.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => response,
    }));

    const result = await fetcher(zType)(EXAMPLE_URL);

    expect(result).toEqual(response);
    expect(global.fetch).toHaveBeenCalledWith(EXAMPLE_URL);
  });

  it('re-throws ZodError when response does not match zod type', async () => {
    const response = { data: 42 };

    mockedFetch.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => response,
    }));

    await expect(fetcher(zType)(EXAMPLE_URL)).rejects.toThrow(ZodError);
  });

  it('calls redirect if response status is 401', async () => {
    const error = new Error('NEXT_REDIRECT');

    mockRedirect.mockImplementationOnce(() => {
      throw error;
    });
    mockedFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 401,
    }));

    await expect(fetcher(zType)(EXAMPLE_URL)).rejects.toThrow();
    expect(global.fetch).toHaveBeenCalledWith(EXAMPLE_URL);
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockRedirect).toHaveBeenCalledWith('/api/auth/signin');
  });

  it('throws if response is not ok', async () => {
    const errorMsg = 'invalid_grant, Session not active';
    const response: { ok: boolean } & PartialResponse = {
      url: EXAMPLE_URL,
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => errorMsg,
    };
    mockedFetch.mockImplementationOnce(async () => response);

    const actual = fetcher(zType)(EXAMPLE_URL);

    await expect(actual).rejects.toThrow(new FetchError(response));
  });
});

describe('fetcherRaw', () => {
  it('returns json response', async () => {
    const response = {
      ok: true,
      json: async () => ({
        data: 'Hello, world!',
      }),
    };
    mockedFetch.mockImplementationOnce(async () => response);

    const result = await fetcherRaw(EXAMPLE_URL);

    expect(result).toEqual(response);
    expect(global.fetch).toHaveBeenCalledWith(EXAMPLE_URL);
  });

  it('re-throws if exception occurs', async () => {
    mockedFetch.mockImplementationOnce(async () => ({
      ok: false,
      text: async () => 'error',
    }));

    await expect(fetcherRaw(EXAMPLE_URL)).rejects.toThrow();
  });

  it('calls redirect if response status is 401', async () => {
    const error = new Error('NEXT_REDIRECT');

    mockRedirect.mockImplementationOnce(() => {
      throw error;
    });
    mockedFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 401,
    }));

    await expect(fetcherRaw(EXAMPLE_URL)).rejects.toThrow();
    expect(global.fetch).toHaveBeenCalledWith(EXAMPLE_URL);
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it('throws if response is not ok', async () => {
    const errorMsg = 'invalid_grant, Session not active';
    const response: { ok: boolean } & PartialResponse = {
      url: EXAMPLE_URL,
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => errorMsg,
    };
    mockedFetch.mockImplementationOnce(async () => response);

    await expect(fetcherRaw(EXAMPLE_URL)).rejects.toThrow(
      new FetchError(response),
    );
  });
});

describe('asyncMkParsedResponse', () => {
  it('returns parsed success response', async () => {
    const fetchFunc = async () => ({ key: 'Hello, world!' });
    const response = await asyncMkParsedResponse(fetchFunc);

    expect(response).toEqual({ data: { key: 'Hello, world!' } });
  });

  it('returns parsed error response if FetchError is thrown', async () => {
    const error = mkFetchError(404, 'Bad Request');
    const fetchFunc = async () => {
      throw error;
    };
    const response = await asyncMkParsedResponse(fetchFunc);

    expect(response).toEqual({ error });
  });

  it('throws error if not FetchError', async () => {
    const error = new Error('maybe Zod Error');
    const fetchFunc = async () => {
      throw error;
    };
    await expect(asyncMkParsedResponse(fetchFunc)).rejects.toThrow(error);
  });
});

describe('logMessage', () => {
  const msg = 'Error fetching data';
  const logError = logMessage(msg);
  const error = new Error('Failed to fetch');

  it('logs a custom message and throws Error', () => {
    expect(() => logError(error)).toThrow();
    expect(mockConsoleError).toHaveBeenCalledWith(msg);
  });
});
