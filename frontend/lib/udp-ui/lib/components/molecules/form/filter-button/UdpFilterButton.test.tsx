import { expect, it, vi } from 'vitest';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UdpFilterButton, { UdpFilterOption } from './UdpFilterButton';

const OPTIONS: UdpFilterOption[] = [
  { id: 'a', label: 'Alpha', checked: true },
  { id: 'b', label: 'Beta', checked: false },
  { id: 'c', label: 'Gamma', checked: false },
];

const openDropdown = async (root: ReturnType<typeof render>) => {
  const trigger = root.getByRole('button', { name: /Filter/ });
  await userEvent.click(trigger);
  return root.getByRole('list', { hidden: true }) ?? root.container;
};

it('renders trigger with label', () => {
  const { getByRole } = render(
    <UdpFilterButton options={OPTIONS} onChange={() => {}} label='Filter' />,
  );
  expect(getByRole('button', { name: /Filter/ })).toBeVisible();
});

it('displays all options once the dropdown is opened', async () => {
  const root = render(
    <UdpFilterButton options={OPTIONS} onChange={() => {}} label='Filter' />,
  );
  const dropdown = await openDropdown(root);
  OPTIONS.forEach(({ label }) =>
    expect(within(dropdown).getByLabelText(label)).toBeInTheDocument(),
  );
});

it('calls onChange with updated options after toggle and apply', async () => {
  const onChange = vi.fn();

  const root = render(
    <UdpFilterButton options={OPTIONS} onChange={onChange} label='Filter' />,
  );

  const dropdown = await openDropdown(root);
  const beta = within(dropdown).getByLabelText('Beta');
  await userEvent.click(beta);
  const applyButton = within(dropdown).getByRole('button', {
    name: 'Anwenden',
  });
  await userEvent.click(applyButton);

  const afterChange = [...OPTIONS];
  afterChange[1].checked = true;
  expect(onChange).toHaveBeenCalledWith(afterChange);
});

it('clears selections and reports via onChange when reset', async () => {
  const onChange = vi.fn();
  const root = render(
    <UdpFilterButton options={OPTIONS} onChange={onChange} label='Filter' />,
  );
  const dropdown = await openDropdown(root);
  const resetButton = within(dropdown).getByRole('button', {
    name: 'Auswahl aufheben',
  });
  await userEvent.click(resetButton);

  const afterChange = OPTIONS.map((o) => ({ ...o, checked: false }));
  expect(onChange).toHaveBeenCalledWith(afterChange);
});
