import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UdpToggleButton from './UdpToggleButton';

describe('snapshot', () => {
  it('matches snapshot with default props', () => {
    const component = render(
      <UdpToggleButton onChange={() => {}}>Toggle me</UdpToggleButton>,
    );

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when `checked` is true', () => {
    const component = render(
      <UdpToggleButton onChange={() => {}} checked>
        Toggle me
      </UdpToggleButton>,
    );

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const component = render(
      <UdpToggleButton onChange={() => {}} className='my-custom-class'>
        Toggle me
      </UdpToggleButton>,
    );

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with icon', () => {
    const component = render(
      <UdpToggleButton onChange={() => {}}>Toggle me</UdpToggleButton>,
    );

    expect(component).toMatchSnapshot();
  });
});

describe('interaction', () => {
  const user = userEvent.setup();

  it('calls `onChange` with true if toggled off', async () => {
    const onChange = vi.fn();
    const component = render(
      <UdpToggleButton onChange={onChange} checked={false}>
        Toggle me
      </UdpToggleButton>,
    );

    const button = component.getByRole('switch');
    await user.click(button);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls `onChange` with false if toggled on', async () => {
    const onChange = vi.fn();
    const component = render(
      <UdpToggleButton onChange={onChange} checked>
        Toggle me
      </UdpToggleButton>,
    );

    const button = component.getByRole('switch');
    await user.click(button);

    expect(onChange).toHaveBeenCalledWith(false);
  });
});
