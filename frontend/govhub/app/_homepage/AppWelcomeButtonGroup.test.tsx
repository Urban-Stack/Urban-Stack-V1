import { render } from '@testing-library/react';
import AppWelcomeButtonGroup from '@/app/_homepage/AppWelcomeButtonGroup';

it('renders component correctly', () => {
  const { container } = render(<AppWelcomeButtonGroup username='Mike Hunt' />);

  expect(container).toMatchSnapshot();
});

it('renders component with additional classes', () => {
  const { container } = render(
    <AppWelcomeButtonGroup username='Mike Hunt' className='my-class' />,
  );

  expect(container.firstChild).toHaveClass('my-class');
});
