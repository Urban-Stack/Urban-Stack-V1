import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import UdpBadge, { UdpBadgeColor } from './UdpBadge';
import React from 'react';

describe('snapshot', () => {
  it('matches snapshot with default values', () => {
    const component = render(<UdpBadge>test</UdpBadge>);

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const component = render(<UdpBadge className={'pt-8'}>test</UdpBadge>);

    expect(component).toMatchSnapshot();
  });

  it.each(UdpBadgeColor)('matches snapshot for `%s` color', (color) => {
    const component = render(<UdpBadge color={color}>test</UdpBadge>);

    expect(component).toMatchSnapshot();
  });

  it.each([true, false])(
    'matches snapshot for `rounded` being `%s`',
    (rounded) => {
      const component = render(<UdpBadge rounded={rounded}>test</UdpBadge>);

      expect(component).toMatchSnapshot();
    },
  );

  it.each([true, false])(
    'matches snapshot for `square` being `%s`',
    (rounded) => {
      const component = render(<UdpBadge square={rounded}>test</UdpBadge>);

      expect(component).toMatchSnapshot();
    },
  );

  it('matches snapshot for button (enabled)', () => {
    const component = render(<UdpBadge onClick={() => {}}>test</UdpBadge>);

    const button = component.getByRole('button');
    expect(button).toBeVisible();
    expect(button).toHaveClass('cursor-pointer');
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot for button (disabled)', () => {
    const component = render(
      <UdpBadge onClick={() => {}} disabled>
        test
      </UdpBadge>,
    );

    const button = component.getByRole('button');
    expect(button).toBeVisible();
    expect(button).toHaveClass('cursor-not-allowed');
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot for link', () => {
    const component = render(
      <UdpBadge href='https://tailwindcss.com'>test</UdpBadge>,
    );

    expect(component.getByRole('link', { name: 'test' })).toBeVisible();
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot for disabled badge', () => {
    const component = render(<UdpBadge disabled>test</UdpBadge>);

    expect(component.getByText('test')).toBeVisible();
    expect(component).toMatchSnapshot();
  });
});

describe('general', () => {
  it('click on badge invokes `onClick` callback function', () => {
    const onClickMock = vi.fn();
    const component = render(<UdpBadge onClick={onClickMock}>test</UdpBadge>);

    component.getByRole('button').click();

    expect(onClickMock).toHaveBeenCalled();
  });

  it('link beats button', () => {
    const component = render(
      <UdpBadge onClick={() => {}} href='https://tailwindcss.com'>
        test
      </UdpBadge>,
    );

    expect(component.getByRole('link', { name: 'test' })).toBeVisible();
  });

  it('renders with custom LinkComp passed via `linkAs`', () => {
    const CustomLink = ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLElement>) => (
      <span data-testid='custom-link' {...props}>
        {children}
      </span>
    );

    const { getByTestId, getByText } = render(
      <UdpBadge linkAs={CustomLink} href='https://example.com'>
        test
      </UdpBadge>,
    );

    const customLink = getByTestId('custom-link');
    expect(customLink).toBeInTheDocument();
    expect(getByText('test')).toBeInTheDocument();
  });
});
