import BackNavigation from './BackNavigation';
import { render } from '@testing-library/react';

jest.mock('udp-ui/components', () => ({
  IcAngleLeft: jest.fn(() => <svg data-testid='ic-angle-left' />),
}));

describe('BackNavigation', () => {
  it('matches snapshot', () => {
    const { container } = render(<BackNavigation href='/custom/link' />);

    expect(container).toMatchSnapshot();
  });
});
