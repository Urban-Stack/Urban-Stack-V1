import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import UdpImageInput from '@/lib/components/molecules/form/image-input/UdpImageInput.tsx';
import React from 'react';
import { TextInput } from 'flowbite-react';
import userEvent from '@testing-library/user-event';

vi.mock('flowbite-react', async (importOriginal) => ({
  ...(await importOriginal()),
  TextInput: vi.fn((props) => (
    <input {...props} data-testid='mocked-textinput' />
  )),
  HelperText: vi.fn(({ children }) => (
    <span data-testid='mocked-helpertext'>{children}</span>
  )),
}));

const expectDefaultTextInput = () => {
  expect(TextInput).toHaveBeenCalledWith(
    expect.objectContaining({
      name: undefined,
      onChange: expect.any(Function),
      placeholder: 'Type something',
      value: '',
    }),
    undefined,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UdpImageInput Component', () => {
  const BasicImageInput: React.FC<{
    currentImageUrl?: string;
    disabled?: boolean;
  }> = ({ currentImageUrl, disabled }) => (
    <UdpImageInput
      placeholder='Type something'
      imageHeading='Preview:'
      imageAlt='No image found'
      removeButtonText='Remove image'
      currentImageUrl={currentImageUrl}
      disabled={disabled}
    />
  );

  it('renders with the correct placeholder text using the fallback descriptor', () => {
    const { container } = render(<BasicImageInput />);

    const input = container.querySelector(
      'input[placeholder="Type something"]',
    );
    expect(input).toBeInTheDocument();
    expectDefaultTextInput();
  });

  it('renders with the default value when currentImageUrl is provided', () => {
    const currentImageUrl = 'https://example.com/image.jpg';

    const { container } = render(
      <BasicImageInput currentImageUrl={currentImageUrl} />,
    );

    const input = container.querySelector(`input[value="${currentImageUrl}"]`);
    expect(input).toBeInTheDocument();
    expect(TextInput).toHaveBeenCalledWith(
      expect.objectContaining({
        name: undefined,
        onChange: expect.any(Function),
        placeholder: 'Type something',
        value: 'https://example.com/image.jpg',
      }),
      undefined,
    );
  });

  it('updates the input value when typing', async () => {
    const user = userEvent.setup();

    const { container } = render(<BasicImageInput />);
    const input = container.querySelector(
      'input[placeholder="Type something"]',
    ) as HTMLInputElement;
    await user.type(input, 'https://example.com/new-image.jpg');

    expect(input.value).toBe('https://example.com/new-image.jpg');
    expectDefaultTextInput();
  });

  it('renders the image preview when a valid URL is entered', async () => {
    const user = userEvent.setup();
    const imageUrl = 'https://example.com/valid-image.jpg';

    const { container } = render(<BasicImageInput />);
    const input = container.querySelector(
      'input[placeholder="Type something"]',
    ) as HTMLInputElement;
    await user.type(input, imageUrl);

    const imagePreview = container.querySelector(`img[src="${imageUrl}"]`);
    expect(imagePreview).toBeInTheDocument();
    expectDefaultTextInput();
  });

  it('disables all inputs when disabled', async () => {
    const imageUrl = 'https://example.com/valid-image.jpg';
    const { container } = render(
      <BasicImageInput currentImageUrl={imageUrl} disabled={true} />,
    );

    const input = container.querySelector(
      'input[placeholder="Type something"]',
    ) as HTMLInputElement;

    const removeButton = container.querySelector('button');

    expect(input).toBeDisabled();
    expect(removeButton).toBeDisabled();
  });

  it('does not render an image preview when an invalid URL is entered', async () => {
    const user = userEvent.setup();
    const invalidUrl = 'invalid-url';

    const { container } = render(<BasicImageInput />);
    const input = container.querySelector(
      'input[placeholder="Type something"]',
    ) as HTMLInputElement;
    await user.type(input, invalidUrl);

    const imagePreview = container.querySelector('img');
    expect(imagePreview).not.toBeInTheDocument();
    expectDefaultTextInput();
  });

  it('renders the remove button when a valid URL is entered', async () => {
    const user = userEvent.setup();
    const imageUrl = 'https://example.com/valid-image.jpg';

    const { container } = render(<BasicImageInput />);
    const input = container.querySelector(
      'input[placeholder="Type something"]',
    ) as HTMLInputElement;
    await user.type(input, imageUrl);

    const removeButton = screen.getByRole('button', { name: /Remove image/ });
    expect(removeButton).toBeEnabled();
    expectDefaultTextInput();
  });

  it('removes the image URL when the remove button is clicked', async () => {
    const user = userEvent.setup();
    const imageUrl = 'https://example.com/valid-image.jpg';

    const { container } = render(<BasicImageInput />);
    const input = container.querySelector(
      'input[placeholder="Type something"]',
    ) as HTMLInputElement;
    await user.type(input, imageUrl);
    const removeButton = container.querySelector('button') as HTMLButtonElement;
    await user.click(removeButton);

    expect(input.value).toBe('');

    const imagePreview = container.querySelector('img');
    expect(imagePreview).not.toBeInTheDocument();
    expectDefaultTextInput();
  });

  it('does not render the remove button when the input value is empty', () => {
    const { container } = render(<BasicImageInput />);
    const removeButton = container.querySelector('button');

    expect(removeButton).not.toBeInTheDocument();
    expectDefaultTextInput();
  });

  it('passes errors to UdpTextInput and renders them', () => {
    const errors = ['Invalid image URL', 'Another error message'];

    const component = render(
      <UdpImageInput
        placeholder='Type something'
        imageHeading='Preview:'
        imageAlt='No image found'
        removeButtonText='Remove image'
        errors={errors}
      />,
    );

    // Shows up as "[object Object], [object Object]" due to the mock
    const helperText = component.getByTestId('mocked-helpertext');
    expect(helperText).not.toBeNull();
  });
});

describe('form reset', () => {
  it('resets text input when form reset is triggered', async () => {
    const user = userEvent.setup();
    const currentImageUrl = 'https://some.url.somewhere';
    const newImageUrlInput = 'BFF';
    const component = render(
      <form>
        <UdpImageInput
          placeholder={'Platzhalter'}
          imageAlt={'Titelbild'}
          removeButtonText={'Titelbild entfernen'}
          currentImageUrl={currentImageUrl}
          data-testid={'SomeId'}
        />
      </form>,
    );

    const form = component.container.querySelector('form');
    const textField = component.container.querySelector('input');
    await user.type(textField!, newImageUrlInput);

    expect(textField).toHaveValue(currentImageUrl + newImageUrlInput);
    fireEvent.reset(form!);
    expect(textField).toHaveValue(currentImageUrl);
  });
});
