import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import UdpProgressBar from './UdpProgressBar';

describe('snapshots', () => {
  it('matches snapshot with default values', () => {
    const component = render(<UdpProgressBar progress={45} />);
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const component = render(
      <UdpProgressBar progress={90} className='min-w-96' />,
    );
    expect(component).toMatchSnapshot();
  });
});
