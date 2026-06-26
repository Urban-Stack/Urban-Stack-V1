import { screen, waitFor } from '@testing-library/react';
import CreateDashboardButton from '@/app/dashboards/_create/CreateDashboardButton';
import { VIZ_GROUPS } from '@/app/dashboards/_internal/testUtils';
import { createRender } from 'udp-ui/test-utils';
import userEvent from '@testing-library/user-event';

const USER = userEvent.setup();

jest.mock('@/app/_lib/superset/actions', () => ({
  createDashboard: jest.fn(),
}));

const renderCreateButton = createRender(CreateDashboardButton, {
  vizGroups: VIZ_GROUPS,
});

describe('structure', () => {
  it('button has correct text', () => {
    renderCreateButton();

    expect(screen.getByRole('button')).toHaveTextContent('Dashboard erstellen');
  });

  it('button is rendered with custom class', () => {
    const customClass = 'custom-class';
    renderCreateButton({ className: customClass });

    expect(screen.getByRole('button')).toHaveClass(customClass);
  });
});

describe('visibility', () => {
  it('initially popover is not rendered', () => {
    renderCreateButton();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('click on trigger button opens form modal', async () => {
    renderCreateButton();
    await USER.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
  });
});
