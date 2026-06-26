import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import React, { RefObject } from 'react';
import { UdpRadioButtonGroup } from '@/lib/components';
import { UdpRadioButtonGroupTestIds as TestIds } from '@/lib/components/molecules/radio-button-group/testIds.ts';
import { createRender } from '@/lib/test-utils';

const GROUP_NAME = 'test-radio-button-group';
const TEST_OPTIONS = {
  'test-label-1': 'test-value-1',
  'test-label-2': 'test-value-2',
  'test-label-3': 'test-value-3',
} as Record<string, string>;
const TEST_LABELS = Object.keys(TEST_OPTIONS);
const TEST_INDEX = 1;
const TEST_ERRORS = ['error #1', 'error #2'];

const renderComp = createRender(UdpRadioButtonGroup, {
  groupName: GROUP_NAME,
  optionsData: TEST_OPTIONS,
});

describe('snapshot', () => {
  it('matches snapshot when unchecked', () => {
    const component = renderComp();

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with preselection', () => {
    const component = renderComp({
      optionsData: TEST_OPTIONS,
      labelChecked: Object.values(TEST_OPTIONS)[1],
    });

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with error messages', () => {
    const component = renderComp({ errors: TEST_ERRORS });

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const component = renderComp({ className: 'pt-8' });

    expect(component).toMatchSnapshot();
  });
});

describe('content', () => {
  it('group contains as many radio buttons as option data entries given', () => {
    renderComp({ optionsData: TEST_OPTIONS });

    const options = screen.getAllByTestId(TestIds.option);
    expect(options).toHaveLength(TEST_LABELS.length);
    options.every((option, idx) =>
      expect(option).toHaveTextContent(TEST_LABELS[idx]),
    );
  });

  it('error messages are shown if given', () => {
    const { container } = renderComp({ errors: TEST_ERRORS });

    TEST_ERRORS.every((error) => expect(container).toHaveTextContent(error));
  });
});

describe('preselection', () => {
  const noneCheckedTestCases = [
    {
      testCase: 'no preselection value specified',
      valueChecked: undefined,
    },
    {
      testCase: 'preselection value is not included',
      valueChecked: 'value-not-in-test-data',
    },
  ];
  it.each(noneCheckedTestCases)(
    'no option is checked if $testCase',
    ({ valueChecked }) => {
      renderComp({
        optionsData: TEST_OPTIONS,
        labelChecked: valueChecked,
      });

      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach((radio) =>
        expect(radio).not.toHaveAttribute('checked'),
      );
    },
  );

  it('option of given preselection value is checked', () => {
    const valueChecked = Object.keys(TEST_OPTIONS)[TEST_INDEX];

    renderComp({
      optionsData: TEST_OPTIONS,
      labelChecked: valueChecked,
    });

    const radioButtons = screen.getAllByRole('radio');
    radioButtons.forEach((radio, index) =>
      index === TEST_INDEX
        ? expect(radio).toHaveAttribute('checked')
        : expect(radio).not.toHaveAttribute('checked'),
    );
  });
});

describe('ref', () => {
  it('checked radio button can be referenced', () => {
    const ref = React.createRef<HTMLElement>();

    renderComp({
      optionsData: TEST_OPTIONS,
      labelChecked: Object.keys(TEST_OPTIONS)[TEST_INDEX],
      ref: ref as RefObject<HTMLInputElement>,
    });

    expect(ref.current).toEqual(screen.getAllByRole('radio')[TEST_INDEX]);
  });
});
