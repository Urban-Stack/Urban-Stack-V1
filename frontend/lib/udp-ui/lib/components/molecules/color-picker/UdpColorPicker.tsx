import React, { Ref, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { UdpColorPickerTestIds } from '@/lib/components/molecules/color-picker/testIds.ts';
import { createTheme, TextInput, TextInputProps } from 'flowbite-react';
import { UdpIcon } from '@/lib/components';
import { registerResetListener } from '@/lib/components/molecules/form/misc/misc.tsx';

interface UdpColorPickerProps extends Pick<
  TextInputProps,
  'name' | 'className' | 'required' | 'disabled'
> {
  hex?: string;
  onChange?: (hex: string) => void;
  autoComplete?: boolean;
}

const REGEX_ALLOWED_INPUT_CHARACTERS = /[^0-9a-fA-F]/g;
const REGEX_VALID_INTERNAL = /^([0-9A-F]{6})$/;

const rectified = (hex: string) =>
  hex.replace(REGEX_ALLOWED_INPUT_CHARACTERS, '').slice(0, 6).toUpperCase();

/**
 * Color picker.
 * <p>
 * This component comprises a text field for inserting a hex value
 * as well as a colored input component for opening a Browser specific color chooser.
 * Both subcomponents represent the same color at any time.
 * <p>
 * The optional `onChange` callback function will be invoked with any new color value
 * which is always a valid 6-digit uppercase hex value (e.g. `AE2FC4`).
 * Accordingly, the function is called exactly every time
 * the component represents a both new and valid color value.
 * <p>
 * If `autoComplete` is set `true` (default),
 * textual input values will be automatically completed from 3 to 6 characters (e.g. `02F` -> `0022FF`).
 * This is triggered on pressing the enter key or if the text field loses focus.
 *
 * @param name         the name to be used when this component is part of a form
 * @param hex          6-digit hex value of the selected color (e.g. `AE2FC4`)
 * @param onChange     callback function invoked on any change of the selected color
 * @param autoComplete `true` in order to automatically complete textual input values - `false` otherwise
 * @param required     `true` if the value of this form component is required for submitting - otherwise `false`
 * @param className    class name for this search bar
 * @constructor
 */
const UdpColorPicker = ({
  name,
  hex,
  onChange = () => {},
  autoComplete = true,
  required = false,
  className,
  disabled = false,
}: UdpColorPickerProps) => {
  const [color, setColor] = useState<string | undefined>(hex && rectified(hex));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    registerResetListener(inputRef, () =>
      setColor((_) => (hex ? rectified(hex) : '')),
    );
  }, [hex]);

  const updateColor = (newHex: string) => {
    setColor(newHex);
    if (color !== newHex && REGEX_VALID_INTERNAL.test(newHex)) {
      onChange(newHex);
    }
  };

  return (
    <div
      className={twMerge('flex gap-3 items-center min-w-40 w-min', className)}
    >
      <HexInputField
        name={name}
        hex={color}
        onChange={updateColor}
        autoComplete={autoComplete}
        required={required}
        ref={inputRef}
        disabled={disabled}
      />
      <ColorSelector hex={color} onChange={updateColor} disabled={disabled} />
    </div>
  );
};

export default UdpColorPicker;

interface HexInputFieldProps {
  name?: string;
  hex?: string;
  onChange: (hex: string) => void;
  autoComplete: boolean;
  required: boolean;
  ref?: Ref<HTMLInputElement>;
  disabled?: boolean;
}

const HexInputField = ({
  name,
  hex,
  onChange,
  autoComplete,
  required,
  ref,
  disabled = false,
}: HexInputFieldProps) => {
  const rectifyInput = (event: React.BaseSyntheticEvent) =>
    (event.target.value = rectified(event.target.value));
  const tryAutoComplete = (event: React.BaseSyntheticEvent) => {
    if (autoComplete && event.target.value.length === 3) {
      onChange(
        event.target.value
          .split('')
          .map((c: string) => c + c)
          .join(''),
      );
    }
  };

  const customTheme = createTheme({
    textInput: {
      field: {
        icon: {
          base: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
          svg: 'h-3 w-3 text-gray-500',
        },
        input: {
          colors: {
            gray: 'text-gray-800 border-gray-300 focus-within:ring-primary-400 focus-within:border-primary-400',
          },
          withIcon: {
            on: 'pl-8',
          },
        },
      },
    },
  });

  return (
    <TextInput
      type={'text'}
      name={name}
      value={hex}
      required={required}
      pattern={'[0-9A-F]{6}'}
      icon={IcHashtag}
      onBlur={tryAutoComplete}
      onChange={(event) => onChange(event.target.value)}
      onInput={rectifyInput}
      onKeyDown={(event) => event.key === 'Enter' && tryAutoComplete(event)}
      theme={customTheme.textInput}
      ref={ref}
      data-testid={UdpColorPickerTestIds.textInput}
      disabled={disabled}
    />
  );
};

interface ColorSelectorProps {
  hex?: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}

const ColorSelector = ({
  hex,
  onChange,
  disabled = false,
}: ColorSelectorProps) => {
  const colorSelectorRingBorderInner = 'border-2 border-transparent';
  const colorSelectorRingBorderOuter = 'shadow-[0px_0px_0px_3px_#28358399]';

  return (
    <div
      className={twMerge(
        'relative rounded-full overflow-hidden inline-flex items-center justify-center',
        colorSelectorRingBorderInner,
        colorSelectorRingBorderOuter,
        'size-8 min-w-8',
      )}
    >
      <input
        type={'color'}
        color={hex}
        value={`#${hex}`}
        className={
          'absolute cursor-pointer size-12 disabled:cursor-not-allowed'
        }
        /* v8 ignore next */
        onChange={(event) =>
          event.target.value && onChange(rectified(event.target.value))
        }
        data-testid={UdpColorPickerTestIds.colorInput}
        disabled={disabled}
      />
    </div>
  );
};

const IcHashtag: UdpIcon = (props) => (
  <svg
    aria-hidden='true'
    xmlns='http://www.w3.org/2000/svg'
    width='12'
    height='12'
    fill='currentColor'
    viewBox='0 0 12 12'
    {...props}
  >
    <text y='12'>#</text>
  </svg>
);
