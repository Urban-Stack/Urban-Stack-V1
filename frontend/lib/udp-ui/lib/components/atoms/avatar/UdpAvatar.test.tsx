import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import UdpAvatar from '@/lib/components/atoms/avatar/UdpAvatar';

describe('image', () => {
  it('matches snapshot with placeholder icon if no image', () => {
    const component = render(<UdpAvatar />);
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with image', () => {
    const component = render(
      <UdpAvatar img='/__snapshots__/avatar-example.jpg' />,
    );
    expect(component).toMatchSnapshot();
  });
});

describe('status indicator', () => {
  it('matches snapshot with online status', () => {
    const component = render(<UdpAvatar status='online' />);
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with offline status', () => {
    const component = render(<UdpAvatar status='offline' />);
    expect(component).toMatchSnapshot();
  });
});
