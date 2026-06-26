import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import UdpToggleIconButton from './UdpToggleIconButton';
import { IcStar } from '@/lib/components/icons';

describe('snapshot', () => {
  it('matches snapshot when inactive', () => {
    const active = false;

    const component = render(
      <UdpToggleIconButton active={active} outlineIcon={IcStar} />,
    );

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when active', () => {
    const active = true;

    const component = render(
      <UdpToggleIconButton active={active} outlineIcon={IcStar} />,
    );

    expect(component).toMatchSnapshot();
  });
});

describe('checked', () => {
  it('checkbox of toggle button is not checked by default', () => {
    const component = render(<UdpToggleIconButton outlineIcon={IcStar} />);

    expect(component.getByRole('checkbox')).not.toBeChecked();
  });

  it('checkbox of toggle button is checked if "active" is true', () => {
    const active = true;

    const component = render(
      <UdpToggleIconButton active={active} outlineIcon={IcStar} />,
    );

    expect(component.getByRole('checkbox')).toBeChecked();
  });

  it('checkbox of toggle button is not checked if "active" is false', () => {
    const active = false;

    const component = render(
      <UdpToggleIconButton active={active} outlineIcon={IcStar} />,
    );

    expect(component.getByRole('checkbox')).not.toBeChecked();
  });
});

describe('click event', () => {
  it('click on inactive toggle button sets it active', () => {
    const component = render(<UdpToggleIconButton outlineIcon={IcStar} />);
    const checkbox = component.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();
    checkbox.click();

    expect(checkbox).toBeChecked();
  });

  it('click on active toggle button sets it inactive', () => {
    const component = render(<UdpToggleIconButton outlineIcon={IcStar} />);
    const checkbox = component.getByRole('checkbox');
    checkbox.click();

    expect(checkbox).toBeChecked();
    checkbox.click();

    expect(checkbox).not.toBeChecked();
  });

  const onClickCallbackTestCases = [
    { testCase: 'inactive', active: false },
    { testCase: 'active', active: true },
  ];
  it.each(onClickCallbackTestCases)(
    'click on $testCase toggle button invokes "onChange" callback function',
    ({ active }) => {
      const onChangeMock = vi.fn();
      const component = render(
        <UdpToggleIconButton
          active={active}
          onChange={onChangeMock}
          outlineIcon={IcStar}
        />,
      );

      component.getByRole('checkbox').click();

      expect(onChangeMock).toHaveBeenCalled();
    },
  );
});
