import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import UdpSearchBar from './UdpSearchBar';
import { TextInput } from 'flowbite-react';
import { IcSearch } from '@/lib/components/icons';

vi.mock('flowbite-react', () => ({
  TextInput: vi.fn((props) => (
    <input {...props} data-testid='mocked-textinput' />
  )),
}));

const CUSTOM_VALUE = 'custom value';
const VALUE = 'test value';

describe('properties', () => {
  it('renders text input with correct properties', () => {
    const restProps = { customkey: CUSTOM_VALUE, value: VALUE };

    render(<UdpSearchBar {...restProps} />);

    expect(TextInput).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'search',
        icon: IcSearch,
        color: 'gray',
        customkey: CUSTOM_VALUE,
        value: VALUE,
      }),
      undefined,
    );
  });
});
