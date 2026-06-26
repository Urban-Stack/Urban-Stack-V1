import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SmartCityDialogLogo from './SmartCityDialogLogo';

describe('BundesministeriumSponsorLogo', () => {
  it('should match snapshot', () => {
    const { container } = render(<SmartCityDialogLogo />);

    expect(container).toMatchSnapshot();
  });
});
