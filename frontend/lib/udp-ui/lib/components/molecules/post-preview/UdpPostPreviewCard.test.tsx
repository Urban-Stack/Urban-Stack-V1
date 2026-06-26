import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import UdpPostPreviewCard from './UdpPostPreviewCard';

describe('UdpPostPreviewCard', () => {
  const mockDate = new Date(2023, 8, 26, 14, 30);

  it('matches its snapshot', () => {
    const { container } = render(
      <UdpPostPreviewCard date={mockDate} href='/'>
        This is a preview of the post.
      </UdpPostPreviewCard>,
    );

    expect(container).toMatchSnapshot();
  });

  it('matches its snapshot with additional classes', () => {
    const { container } = render(
      <UdpPostPreviewCard date={mockDate} className='pt-8' href='/'>
        This is a preview of the post.
      </UdpPostPreviewCard>,
    );

    expect(container).toMatchSnapshot();
  });

  it('matches its snapshot with cut off text', () => {
    const { container } = render(
      <UdpPostPreviewCard date={mockDate} className='w-32' href='/'>
        This is a preview of the post.
      </UdpPostPreviewCard>,
    );

    expect(container).toMatchSnapshot();
  });
});
