import { render } from '@testing-library/react';
import NotFoundPage from '@/app/not-found';
import { themeOrDefault } from '@/app/_lib/theme';
import { FuncMock } from '@/app/_test/utils';
import { DEFAULT_THEME } from 'udp-ui/theme';

const themeOrDefaultMock: FuncMock<typeof themeOrDefault> =
  themeOrDefault as unknown as jest.Mock;
jest.mock('@/app/_lib/theme', () => ({
  themeOrDefault: jest.fn(),
}));

beforeAll(() => {
  themeOrDefaultMock.mockResolvedValue(DEFAULT_THEME);
});

describe('snapshot', () => {
  it('matches snapshot', async () => {
    const { container } = render(await NotFoundPage());

    expect(container).toMatchSnapshot();
  });
});
