import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelperText, Textarea } from 'flowbite-react';
import UdpTextArea from './UdpTextArea';
import { Ref } from 'react';

vi.mock('flowbite-react', () => ({
  Textarea: vi.fn((props) => (
    <textarea {...props} data-testid='mocked-textarea' />
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

      render(<UdpTextArea className={className} />);

      expect(Textarea).toHaveBeenCalledWith(
        expect.objectContaining({
          className: `focus:outline-hidden focus:ring-1 focus:ring-primary-500 ${className}`,
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
        render(<UdpTextArea errors={errors} />);

        expect(Textarea).toHaveBeenCalledWith(
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
      const ref: Ref<HTMLTextAreaElement> = {
        current: <div>test-current</div>,
      } as unknown as Ref<HTMLTextAreaElement>;

      render(<UdpTextArea ref={ref} />);

      expect(Textarea).toHaveBeenCalledWith(
        expect.objectContaining({
          ref,
        }),
        undefined,
      );
    });
  });
});

describe('helper text', () => {
  test('renders with single error message', () => {
    const errorMsg = 'Single error';

    const { container } = render(<UdpTextArea errors={[errorMsg]} />);

    expect(HelperText).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'failure' }),
      undefined,
    );
    expect(container).toHaveTextContent(errorMsg);
  });

  test('renders with multiple error messages', () => {
    const errors = ['Error 1', 'Error 2'];

    const { container } = render(<UdpTextArea errors={errors} />);

    expect(HelperText).toHaveBeenCalled();
    errors.forEach((msg) => expect(container).toHaveTextContent(msg));
  });
});
