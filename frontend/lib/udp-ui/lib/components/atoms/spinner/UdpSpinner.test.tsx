import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import UdpSpinner from './UdpSpinner';

describe('snapshots', () => {
  it('matches snapshot with default values', () => {
    const component = render(<UdpSpinner />);
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const component = render(<UdpSpinner className={'fill-red-700'} />);
    expect(component).toMatchSnapshot();
  });
});
