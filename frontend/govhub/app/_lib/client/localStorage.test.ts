import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from '@/app/_lib/client/localStorage';
import { FuncMock } from '@/app/_test/utils';

const mockGetItem: FuncMock<typeof global.localStorage.getItem> = jest.fn();
const mockSetItem: FuncMock<typeof global.localStorage.setItem> = jest.fn();
const mockRemoveItem: FuncMock<typeof global.localStorage.getItem> = jest.fn();

const KEY = 'UGH_SIDEBAR_OPEN';

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

describe('getLocalStorage', () => {
  it.each(['true', 'false'])('returns value from localStorage', (value) => {
    mockGetItem.mockImplementation((key) => (key === KEY ? value : null));
    const actual = getLocalStorage(KEY);
    expect(actual).toBe(value);
  });
});

describe('setLocalStorage', () => {
  it.each(['true', 'false'])('sets value to localStorage', (value) => {
    setLocalStorage(KEY, value);
    expect(mockSetItem).toHaveBeenCalledWith(KEY, value);
  });
});

describe('removeLocalStorage', () => {
  it('removes value from localStorage', () => {
    removeLocalStorage(KEY);
    expect(mockRemoveItem).toHaveBeenCalledWith(KEY);
  });
});
