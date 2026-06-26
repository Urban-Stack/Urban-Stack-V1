import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import UdpFallback from './UdpFallback';
import { NoSearchResultIcon } from '@/lib/components/icons';

describe('snapshots', () => {
  it('matches snapshot with single-line description', () => {
    const component = render(
      <UdpFallback
        icon={NoSearchResultIcon}
        title={'fallback title'}
        description={'fallback description'}
      />,
    );
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with multi-line description', () => {
    const component = render(
      <UdpFallback
        icon={NoSearchResultIcon}
        title={'fallback title'}
        description={'multiline\nfallback description'}
      />,
    );
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with children', () => {
    const component = render(
      <UdpFallback
        icon={NoSearchResultIcon}
        title={'fallback title'}
        description={'fallback description'}
      >
        <span>fallback child component</span>
      </UdpFallback>,
    );
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const component = render(
      <UdpFallback
        icon={NoSearchResultIcon}
        title={'fallback title'}
        description={'fallback description'}
        className={'p-8'}
      />,
    );
    expect(component).toMatchSnapshot();
  });
});
