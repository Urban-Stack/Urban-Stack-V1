import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DangerZoneDialog from './UdpDangerZoneDialog';
import userEvent from '@testing-library/user-event';

describe('Snapshots', () => {
  it('matches snapshot', () => {
    const component = render(
      <DangerZoneDialog
        deleteCallback={() => Promise.resolve()}
        headlineText='Text A'
        explainerText='Text B'
        labelText='Text C'
        resourceName='Test'
      />,
    );

    expect(component).toMatchSnapshot();
  });
});

describe('functionality', () => {
  it('renders the component correctly', () => {
    const component = render(
      <DangerZoneDialog
        deleteCallback={() => Promise.resolve()}
        headlineText='Text A'
        explainerText='Text B'
        labelText='Text C'
        resourceName='Test'
      />,
    );

    expect(component.getByText('Text A')).toBeVisible();

    expect(component.getByRole('button', { name: /Löschen/ })).toBeDisabled();
  });

  it('enables the button when the project name is entered and fires the correct callback', async () => {
    const user = userEvent.setup();

    const callback = vi.fn().mockResolvedValue({});

    const componentProps = {
      deleteCallback: callback,
      headlineText: 'Text A',
      explainerText: 'Text B',
      labelText: 'Text C',
      resourceName: 'Test',
      formData: null,
    };

    const component = render(<DangerZoneDialog {...componentProps} />);

    const input = component.getByRole('textbox', {
      name: 'Text C',
    });
    await user.type(input, 'Test');

    const button = component.getByRole('button', { name: /Löschen/ });

    expect(button).not.toBeDisabled();

    await user.click(button);

    expect(componentProps.deleteCallback).toHaveBeenCalledOnce();
  });

  it('does not enable button with wrong input', async () => {
    const user = userEvent.setup();

    const component = render(
      <DangerZoneDialog
        deleteCallback={() => Promise.resolve()}
        headlineText='Text A'
        explainerText='Text B'
        labelText='Text C'
        resourceName='Test'
      />,
    );

    expect(component.getByText('Text A')).toBeVisible();
    expect(component.getByRole('button', { name: /Löschen/ })).toBeDisabled();

    const input = component.getByRole('textbox', {
      name: 'Text C',
    });

    await user.type(input, 'Tes');

    expect(component.getByRole('button', { name: /Löschen/ })).toBeDisabled();
  });
});
