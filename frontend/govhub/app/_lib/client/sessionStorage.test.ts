import { FuncMock } from '@/app/_test/utils';
import {
  getSessionStorage,
  removeSessionStorage,
  SessionStorageKey,
  setSessionStorage,
} from '@/app/_lib/client/sessionStorage';

const mockGetItem: FuncMock<typeof global.sessionStorage.getItem> = jest.fn();
const mockSetItem: FuncMock<typeof global.sessionStorage.setItem> = jest.fn();
const mockRemoveItem: FuncMock<typeof global.sessionStorage.getItem> =
  jest.fn();

const KEY: SessionStorageKey = 'UGH_DISCOURSE_LAST_CHANNEL_ID';

beforeAll(() => {
  global.Storage.prototype.getItem = mockGetItem;
  global.Storage.prototype.setItem = mockSetItem;
  global.Storage.prototype.removeItem = mockRemoveItem;
});

beforeEach(() => {
  mockGetItem.mockReset();
  mockSetItem.mockReset();
  mockRemoveItem.mockReset();
});

describe('getSessionStorage', () => {
  it.each(['1', '2'])('returns value from sessionStorage', (value) => {
    mockGetItem.mockImplementation((key) => (key === KEY ? value : null));
    const actual = getSessionStorage(KEY);
    expect(actual).toBe(value);
  });
});

describe('setSessionStorage', () => {
  it.each(['1', '2'])('sets value to sessionStorage', (value) => {
    setSessionStorage(KEY, value);
    expect(mockSetItem).toHaveBeenCalledWith(KEY, value);
  });
});

describe('removeSessionStorage', () => {
  it('removes value from sessionStorage', () => {
    removeSessionStorage(KEY);
    expect(mockRemoveItem).toHaveBeenCalledWith(KEY);
  });
});
