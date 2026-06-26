import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IcHome } from '@/lib/components/icons';
import UdpButton, { UdpButtonColor } from './UdpButton';
import { UdpButtonTestIds } from '@/lib/components/atoms/button/testIds.ts';
import { createRender } from '@/lib/test-utils';

type RenderProps = {
  testCase: string;
  href?: string;
};

describe('snapshot', () => {
  describe.each([
    { testCase: 'button element' },
    { testCase: 'Link element', href: '/' },
  ] as RenderProps[])('$testCase', (item) => {
    const renderButton = createRender(UdpButton, {
      href: item.href,
      children: 'test',
    });

    describe('enabled', () => {
      it.each(UdpButtonColor)(`matches snapshot with '%s' color`, (color) => {
        const component = renderButton({ color });
        expect(component).toMatchSnapshot();
      });

      it('matches snapshot with icon', () => {
        const component = renderButton({ icon: IcHome });
        expect(component).toMatchSnapshot();
      });

      it('matches snapshot with additional classes', () => {
        const component = renderButton({ className: 'px-8' });
        expect(component).toMatchSnapshot();
      });
    });

    describe('disabled', () => {
      it.each(UdpButtonColor)(`matches snapshot with '%s' color`, (color) => {
        const component = renderButton({ color, disabled: true });
        expect(component).toMatchSnapshot();
      });

      it('matches snapshot with icon', () => {
        const component = renderButton({ icon: IcHome, disabled: true });
        expect(component).toMatchSnapshot();
      });

      it('matches snapshot with additional classes', () => {
        const component = renderButton({ className: 'px-8', disabled: true });
        expect(component).toMatchSnapshot();
      });
    });
  });
});

describe('properties', () => {
  it('renders as button if no href is provided', () => {
    const { container } = render(<UdpButton>test</UdpButton>);
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('renders as button even with href provided if disabled', () => {
    const { container } = render(
      <UdpButton href='/' disabled={true}>
        test
      </UdpButton>,
    );
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('renders as link if href is provided', () => {
    const { container } = render(<UdpButton href='/'>test</UdpButton>);
    expect(container.querySelector('a')).toBeInTheDocument();
  });

  it('renders with role button if href is provided', () => {
    const { container } = render(<UdpButton href='/'>test</UdpButton>);
    expect(container.querySelector('a')).toHaveAttribute('role', 'button');
  });

  it('renders with type button if no type is provided', () => {
    const { container } = render(<UdpButton>test</UdpButton>);
    expect(container.querySelector('button')).toHaveAttribute('type', 'button');
  });

  it('renders as custom link component if linkAs is provided', () => {
    const Link = ({ ...props }) => <div {...props}>correctly rendered</div>;
    const { container } = render(
      <UdpButton linkAs={Link} href='/bla'>
        test
      </UdpButton>,
    );
    const div = container.querySelector('div');

    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent('correctly rendered');
  });

  describe('loading spinner', () => {
    it('renders loading spinner when loading is true and component is button', () => {
      render(<UdpButton loading>test</UdpButton>);

      expect(screen.getByTestId(UdpButtonTestIds.spinner)).toBeVisible();
    });

    it('does not render loading spinner when loading is true and component is link', () => {
      render(
        <UdpButton loading href='/'>
          test
        </UdpButton>,
      );

      expect(
        screen.queryByTestId(UdpButtonTestIds.spinner),
      ).not.toBeInTheDocument();
    });
  });
});
