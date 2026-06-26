import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelperText, TextInput } from 'flowbite-react';
import UdpTextInput from './UdpTextInput.tsx';
import { IcGlobe } from '@/lib/components/icons';
import { Ref } from 'react';

vi.mock('flowbite-react', () => ({
  TextInput: vi.fn((props) => (
    <input {...props} data-testid='mocked-textinput' />
  )),
  HelperText: vi.fn(({ children }) => (
    <span data-testid='mocked-helpertext'>{children}</span>
  )),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('properties', () => {
  describe('className', () => {
    test('renders with className', () => {
      const className = 'test-class-name';

      render(<UdpTextInput className={className} />);

      expect(TextInput).toHaveBeenCalledWith(
        expect.objectContaining({
          className: `focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${className}`,
        }),
        undefined,
      );
    });
  });

  describe('type', () => {
    test('renders with type', () => {
      const type = 'test-type';

      render(<UdpTextInput type={type} />);

      expect(TextInput).toHaveBeenCalledWith(
        expect.objectContaining({
          type: type,
        }),
        undefined,
      );
    });
  });

  describe('color', () => {
    const COLOR_TEST_CASES = [
      {
        testCase: 'any errors given',
        errors: ['any error'],
        expectedColor: 'failure',
      },
      {
        testCase: 'no errors',
        errors: undefined,
        expectedColor: 'gray',
      },
    ];
    test.each(COLOR_TEST_CASES)(
      'renders with $expectedColor color if $testCase',
      ({ errors, expectedColor }) => {
        render(<UdpTextInput errors={errors} />);

        expect(TextInput).toHaveBeenCalledWith(
          expect.objectContaining({
            color: expectedColor,
          }),
          undefined,
        );
      },
    );
  });

  describe('ref', () => {
    test('renders with ref', () => {
      const ref: Ref<HTMLInputElement> = {
        current: <div>test-current</div>,
      } as unknown as Ref<HTMLInputElement>;

      render(<UdpTextInput ref={ref} />);

      expect(TextInput).toHaveBeenCalledWith(
        expect.objectContaining({
          ref: ref,
        }),
        undefined,
      );
    });
  });

  describe('icon', () => {
    test('renders with icon', () => {
      const icon = IcGlobe;

      render(<UdpTextInput icon={icon} />);

      expect(TextInput).toHaveBeenCalledWith(
        expect.objectContaining({ icon: icon }),
        undefined,
      );
    });
  });
});

describe('helper text', () => {
  test('renders with single error message', () => {
    const errorMsg = 'Single error';

    const { container } = render(<UdpTextInput errors={[errorMsg]} />);

    expect(HelperText).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'failure' }),
      undefined,
    );
    expect(container).toHaveTextContent(errorMsg);
  });

  test('renders with multiple error messages', () => {
    const errors = ['Error 1', 'Error 2'];

    const { container } = render(<UdpTextInput errors={errors} />);

    expect(HelperText).toHaveBeenCalled();
    errors.forEach((msg) => expect(container).toHaveTextContent(msg));
  });
});
