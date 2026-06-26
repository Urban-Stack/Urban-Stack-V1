import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, RenderResult } from '@testing-library/react';
import UdpColorPicker from '@/lib/components/molecules/color-picker/UdpColorPicker.tsx';
import userEvent from '@testing-library/user-event';
import { UdpColorPickerTestIds as TestIds } from '@/lib/components/molecules/color-picker/testIds.ts';
import React from 'react';

const TEST_HEX = 'A1C3F4';

const expectColorSelected = (component: RenderResult, hex: string) => {
  expect(component.getByTestId(TestIds.textInput)).toHaveValue(hex);
  expect(component.getByTestId(TestIds.colorInput)).toHaveAttribute(
    'color',
    hex,
  );
};

describe('snapshot', () => {
  it('matches snapshot', () => {
    const component = render(<UdpColorPicker hex={TEST_HEX} />);

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const component = render(
      <UdpColorPicker hex={TEST_HEX} className={'pt-8'} />,
    );

    expect(component).toMatchSnapshot();
  });
});

describe('text input', () => {
  it('color selection via text input invokes "onChange" callback function', async () => {
    const user = userEvent.setup();
    const onChangeMock = vi.fn();
    const component = render(
      <UdpColorPicker hex={''} onChange={onChangeMock} />,
    );
    const textField = component.getByTestId(TestIds.textInput);

    await user.type(textField, TEST_HEX);

    expectColorSelected(component, TEST_HEX);
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith(TEST_HEX);
  });

  describe('auto correction', () => {
    describe('property', () => {
      it.each([
        ['maximum of 6 characters can be given', '01AB56FF', '01AB56'],
        ['invalid characters are rejected', 'ASDF01', 'ADF01'],
        ['lower case is replaced by upper case', 'a1b2c4', 'A1B2C4'],
        ['leading # is removed', '#A1B2C4', 'A1B2C4'],
      ])('%s', async (_, givenHex, expectedText) => {
        const component = render(<UdpColorPicker hex={givenHex} />);

        expectColorSelected(component, expectedText);
      });
    });

    describe('input', () => {
      it('maximum of 6 characters can be entered', async () => {
        const actualInput = '01AB56FF';
        const expectedText = '01AB56';
        const user = userEvent.setup();
        const onChangeMock = vi.fn();
        const component = render(
          <UdpColorPicker hex={''} onChange={onChangeMock} />,
        );
        const textField = component.getByTestId(TestIds.textInput);

        await user.type(textField, actualInput);

        expectColorSelected(component, expectedText);
        expect(onChangeMock).toHaveBeenCalledTimes(1);
        expect(onChangeMock).toHaveBeenCalledWith(expectedText);
        expect(onChangeMock).not.toHaveBeenCalledWith(actualInput);
      });

      it('invalid characters are rejected', async () => {
        const actualInput = 'ASDF01';
        const expectedText = 'ADF01';
        const user = userEvent.setup();
        const onChangeMock = vi.fn();
        const component = render(
          <UdpColorPicker hex={''} onChange={onChangeMock} />,
        );
        const textField = component.getByTestId(TestIds.textInput);

        await user.type(textField, actualInput);

        expectColorSelected(component, expectedText);
        expect(onChangeMock).not.toHaveBeenCalled(); // result is no valid hex value
      });

      it('lower case is replaced by upper case', async () => {
        const actualInput = 'a1b2c4';
        const expectedText = 'A1B2C4';
        const user = userEvent.setup();
        const onChangeMock = vi.fn();
        const component = render(
          <UdpColorPicker hex={''} onChange={onChangeMock} />,
        );
        const textField = component.getByTestId(TestIds.textInput);

        await user.type(textField, actualInput);

        expectColorSelected(component, expectedText);
        expect(onChangeMock).toHaveBeenCalledTimes(1);
        expect(onChangeMock).toHaveBeenCalledWith(expectedText);
      });

      it('leading # is removed', async () => {
        const actualInput = '#A1B2C4';
        const expectedText = 'A1B2C4';
        const user = userEvent.setup();
        const onChangeMock = vi.fn();
        const component = render(
          <UdpColorPicker hex={''} onChange={onChangeMock} />,
        );
        const textField = component.getByTestId(TestIds.textInput);

        await user.type(textField, actualInput);

        expectColorSelected(component, expectedText);
        expect(onChangeMock).toHaveBeenCalledTimes(1);
        expect(onChangeMock).toHaveBeenCalledWith(expectedText);
        expect(onChangeMock).not.toHaveBeenCalledWith(actualInput);
      });

      it('gets disabled when set disabled', async () => {
        const component = render(<UdpColorPicker hex={''} disabled={true} />);

        const textField = component.getByTestId(TestIds.textInput);
        const colorInput = component.getByTestId(TestIds.colorInput);

        expect(textField).toBeDisabled();
        expect(colorInput).toBeDisabled();
      });
    });
  });

  describe('autoComplete', () => {
    const ACTUAL_INPUT = 'A1F';
    const EXPECTED_TEXT = 'AA11FF';

    const autoCompletionTestCases = [
      ['enter key pressed', '{enter}'],
      ['focus lost', '{tab}'],
    ];

    it.each(autoCompletionTestCases)(
      'auto completing 3 to 6 characters when %s',
      async (_, keyText) => {
        const autoComplete = true;
        const user = userEvent.setup();
        const onChangeMock = vi.fn();
        const component = render(
          <UdpColorPicker
            hex={''}
            autoComplete={autoComplete}
            onChange={onChangeMock}
          />,
        );
        const textField = component.getByTestId(TestIds.textInput);

        await user.type(textField, ACTUAL_INPUT);
        await user.type(textField, keyText);

        expectColorSelected(component, EXPECTED_TEXT);
        expect(onChangeMock).toHaveBeenCalledTimes(1);
        expect(onChangeMock).toHaveBeenCalledWith(EXPECTED_TEXT);
      },
    );

    it.each(autoCompletionTestCases)(
      'when auto completion is off does not change input when %s',
      async (_, keyText) => {
        const autoComplete = false;
        const user = userEvent.setup();
        const onChangeMock = vi.fn();
        const component = render(
          <UdpColorPicker
            hex={''}
            autoComplete={autoComplete}
            onChange={onChangeMock}
          />,
        );
        const textField = component.getByTestId(TestIds.textInput);

        await user.type(textField, ACTUAL_INPUT);
        onChangeMock.mockReset();
        await user.type(textField, keyText);

        expectColorSelected(component, ACTUAL_INPUT);
        expect(onChangeMock).not.toHaveBeenCalled();
      },
    );
  });

  describe('form reset', () => {
    it('resets hex input when form reset is triggered', async () => {
      const user = userEvent.setup();
      const component = render(
        <form>
          <UdpColorPicker hex={TEST_HEX} />
        </form>,
      );

      const form = component.container.querySelector('form');
      const textField = component.getByTestId(TestIds.textInput);
      await user.clear(textField);
      await user.type(textField, 'BFF');
      fireEvent.reset(form!);

      expectColorSelected(component, TEST_HEX);
    });
  });
});
