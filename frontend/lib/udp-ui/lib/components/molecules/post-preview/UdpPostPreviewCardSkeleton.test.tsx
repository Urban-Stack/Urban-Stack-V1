import { expect, it } from 'vitest';
import { render } from '@testing-library/react';
import UdpPostPreviewCardSkeleton from './UdpPostPreviewCardSkeleton';

it('correctly renders skeleton', () => {
  const { container } = render(<UdpPostPreviewCardSkeleton />);

  expect(container).toMatchSnapshot();
});
