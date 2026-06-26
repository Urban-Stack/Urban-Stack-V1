import { describe, it, expect, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { IcList, IcGrid, IcPlus } from '@/lib/components/icons';
import UdpButtonGroup, { UdpButtonGroupDataArray } from './UdpButtonGroup';

const testButtonsData = new UdpButtonGroupDataArray(
  {
    icon: IcList,
    label: 'List',
    onSelect: () => {},
  },
  {
    icon: IcGrid,
    label: 'Grid',
    onSelect: () => {},
  },
  {
    icon: IcPlus,
    label: 'Plus',
    onSelect: () => {},
  },
);

describe('snapshot', () => {
  it('matches snapshot for multiple buttons', () => {
    const component = render(<UdpButtonGroup buttonsData={testButtonsData} />);

    expect(component.container.querySelectorAll('button')).toHaveLength(3);
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with custom selection', () => {
    const component = render(
      <UdpButtonGroup buttonsData={testButtonsData} indexSelected={1} />,
    );

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const component = render(
      <UdpButtonGroup buttonsData={testButtonsData} className={'pt-8'} />,
    );

    expect(component).toMatchSnapshot();
  });
});

describe('initial selection', () => {
  it('initially the button of the given index is selected', () => {
    const indexSelected = 1;
    const { container } = render(
      <UdpButtonGroup
        buttonsData={testButtonsData}
        indexSelected={indexSelected}
      />,
    );

    expectButtonToBeSelected(container, indexSelected);
  });

  it('initially the first button is selected if no index is provided', () => {
    const defaultIndex = 0;
    const { container } = render(
      <UdpButtonGroup buttonsData={testButtonsData} />,
    );

    expectButtonToBeSelected(container, defaultIndex);
  });

  it('the first button is selected if the selection index is negative', () => {
    const negativeIndex = -1;
    const { container } = render(
      <UdpButtonGroup
        buttonsData={testButtonsData}
        indexSelected={negativeIndex}
      />,
    );

    expectButtonToBeSelected(container, 0);
  });

  it("the last button is selected if the selection index exceeds the array's range", () => {
    const exceedingIndex = testButtonsData.array.length;
    const { container } = render(
      <UdpButtonGroup
        buttonsData={testButtonsData}
        indexSelected={exceedingIndex}
      />,
    );

    expectButtonToBeSelected(container, testButtonsData.array.length - 1);
  });
});

describe('click events', () => {
  it('click on a non-selected button changes selection', () => {
    const oldIndex = 0;
    const newIndex = 1;

    const { container } = render(
      <UdpButtonGroup buttonsData={testButtonsData} indexSelected={oldIndex} />,
    );

    expectButtonToBeSelected(container, oldIndex);
    act(() => {
      container.querySelectorAll('button')[newIndex].click();
    });
    expectButtonToBeSelected(container, newIndex);
  });

  it('click on the selected button does not change selection', () => {
    const indexSelected = 1;
    const { container } = render(
      <UdpButtonGroup
        buttonsData={testButtonsData}
        indexSelected={indexSelected}
      />,
    );

    expectButtonToBeSelected(container, indexSelected);
    act(() => {
      container.querySelectorAll('button')[indexSelected].click();
    });
    expectButtonToBeSelected(container, indexSelected);
  });

  it('click on a non-selected button invokes callback function', () => {
    const oldIndex = 0;
    const newIndex = 1;
    testButtonsData.array[newIndex].onSelect = vi.fn();
    const { container } = render(
      <UdpButtonGroup buttonsData={testButtonsData} indexSelected={oldIndex} />,
    );

    act(() => {
      container.querySelectorAll('button')[newIndex].click();
    });

    expect(testButtonsData.array[newIndex].onSelect).toHaveBeenCalled();
  });

  it('click on the selected button does not invoke callback function', () => {
    const indexSelected = 1;
    testButtonsData.array[indexSelected].onSelect = vi.fn();
    const { container } = render(
      <UdpButtonGroup
        buttonsData={testButtonsData}
        indexSelected={indexSelected}
      />,
    );

    act(() => {
      container.querySelectorAll('button')[indexSelected].click();
    });

    expect(
      testButtonsData.array[indexSelected].onSelect,
    ).not.toHaveBeenCalled();
  });
});

const selected = 'selected';
const expectButtonToBeSelected = (
  container: HTMLElement,
  indexSelected: number,
) => {
  const buttons = container.querySelectorAll('button');
  buttons.forEach((button, index) =>
    index === indexSelected
      ? expect(button).toHaveClass(selected)
      : expect(button).not.toHaveClass(selected),
  );
};
