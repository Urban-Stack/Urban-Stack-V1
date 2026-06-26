import { render, screen } from '@testing-library/react';
import CitytoolLayout from './layout';

describe('CitytoolLayout', () => {
  it('renders the heading and children', async () => {
    render(
      <CitytoolLayout>
        <div>child content</div>
      </CitytoolLayout>,
    );
    expect(screen.getByText('City Tools')).toBeInTheDocument();
    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});
