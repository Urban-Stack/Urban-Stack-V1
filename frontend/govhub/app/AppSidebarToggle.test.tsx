import { act, render } from '@testing-library/react';
import AppSidebarToggle from '@/app/AppSidebarToggle';

describe('UdpSidebarToggle', () => {
  it('shows bars icon if sidebar is collapsed', () => {
    const component = render(<AppSidebarToggle />);
    expect(component).toMatchSnapshot();
  });

  it('shows close icon if sidebar is open', async () => {
    const component = render(<AppSidebarToggle />);

    act(() => {
      component.getByRole('button').click();
    });

    expect(await component.findByRole('button')).toMatchSnapshot();
  });

  it('contains correct label', () => {
    const component = render(<AppSidebarToggle />);
    expect(component.getByRole('button')).toHaveAttribute(
      'label',
      'Seitenmenü öffnen',
    );
  });
});
