import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import UdpTileButton from './UdpTileButton';
import { ContactHelpdeskIcon } from '@/lib/components/icons';

describe('UdpTileButton', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <UdpTileButton icon={ContactHelpdeskIcon} label={'Button Text'} />,
    );

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const { container } = render(
      <UdpTileButton
        icon={ContactHelpdeskIcon}
        label={'Button Text'}
        className='pt-8'
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
