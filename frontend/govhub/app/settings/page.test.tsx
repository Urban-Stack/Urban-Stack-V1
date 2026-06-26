import { render } from '@testing-library/react';
import SettingsPage from '@/app/settings/page';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

describe('Settings Page', () => {
  it('renders page as expected', () => {
    const { container } = render(<SettingsPage />);
    expect(container).toMatchSnapshot();
  });
});
