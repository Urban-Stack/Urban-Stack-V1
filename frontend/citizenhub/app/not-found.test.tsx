import { render } from '@testing-library/react';
import NotFoundPage from '@/app/not-found';

describe('snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(<NotFoundPage />);

    expect(container).toMatchSnapshot();
  });
});
