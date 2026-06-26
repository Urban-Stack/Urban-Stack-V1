import { redirect } from 'next/navigation';
import { FuncMock } from '@/app/_test/utils';
import { render } from '@testing-library/react';
import RootPage from '@/app/page';

const mockRedirect = redirect as FuncMock<typeof redirect>;
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('navigation', () => {
  it('redirects to default tenant', () => {
    render(<RootPage />);

    expect(mockRedirect).toHaveBeenCalledWith('/guetersloh');
  });
});
