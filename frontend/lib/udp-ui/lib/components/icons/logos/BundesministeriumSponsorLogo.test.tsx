import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import BundesministeriumSponsorLogo from './BundesministeriumSponsorLogo';

describe('BundesministeriumSponsorLogo', () => {
  it('should match snapshot', () => {
    const { container } = render(<BundesministeriumSponsorLogo />);

    expect(container).toMatchSnapshot();
  });
});
