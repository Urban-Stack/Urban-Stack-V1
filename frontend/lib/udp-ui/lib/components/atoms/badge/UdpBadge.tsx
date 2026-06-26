import React from 'react';
import { twMerge } from 'tailwind-merge';
import {
  COLOR_CLASS,
  COLOR_CLASS_CLICKABLE,
  COLOR_CLASS_DISABLED,
} from './util.ts';
import { createTheme, Spinner, SpinnerTheme } from 'flowbite-react';
import { SPINNER_THEME } from '@/lib/components/atoms/spinner/theme.ts';
import { DeepPartial } from 'flowbite-react/types';

export const UdpBadgeColor = [
  'primary',
  'success',
  'warning',
  'danger',
] as const;
export type UdpBadgeColor = (typeof UdpBadgeColor)[number];

interface LinkProps extends Partial<
  Pick<React.ComponentPropsWithoutRef<'a'>, 'href' | 'target'>
> {
  linkAs?: React.ElementType;
}

export interface UdpBadgeProps
  extends
    Partial<
      React.HTMLAttributes<HTMLElement> &
        Pick<
          React.ComponentPropsWithoutRef<'button'>,
          'className' | 'children' | 'onClick'
        >
    >,
    LinkProps {
  rounded?: boolean;
  square?: boolean;
  loading?: boolean;
  color?: UdpBadgeColor;
  disabled?: boolean;
}

const UdpBadge = ({
  children,
  className,
  rounded = false,
  square = false,
  loading = false,
  color = 'primary',
  href,
  target,
  linkAs: LinkComp,
  onClick,
  disabled = false,
  ...props
}: UdpBadgeProps) => {
  const roundedClass = rounded ? 'rounded-full' : 'rounded-md';
  const isLoading = !disabled && !href && !!onClick && loading;

  const clickableClass = twMerge(
    'focus:outline-none focus:ring-3',
    roundedClass,
    COLOR_CLASS_CLICKABLE[color],
  );
  const linkClass = twMerge('block', clickableClass);
  const buttonClass = twMerge(
    clickableClass,
    disabled || isLoading ? 'cursor-not-allowed' : 'cursor-pointer',
  );

  const badgeInnerProps = {
    color,
    isLoading,
    square,
    roundedClass,
    rounded,
    disabled,
    children,
    className,
  };

  if (href && !disabled) {
    const badgeContent = <BadgeInner {...badgeInnerProps} clickable />;
    return LinkComp ? (
      <LinkComp href={href} target={target} className={linkClass} {...props}>
        {badgeContent}
      </LinkComp>
    ) : (
      <a href={href} target={target} className={linkClass} {...props}>
        {badgeContent}
      </a>
    );
  }
  if (onClick)
    return (
      <button
        type='button'
        onClick={onClick}
        disabled={isLoading}
        className={buttonClass}
        {...props}
      >
        <BadgeInner {...badgeInnerProps} clickable={!isLoading} />
      </button>
    );
  return <BadgeInner {...badgeInnerProps} {...props} />;
};

interface BadgeInnerProps extends React.ComponentPropsWithoutRef<'div'> {
  color: UdpBadgeColor;
  isLoading: boolean;
  square: boolean;
  roundedClass: string;
  rounded: boolean;
  disabled: boolean;
  clickable?: boolean;
}

const BadgeInner = ({
  color,
  isLoading,
  square,
  roundedClass,
  rounded,
  disabled,
  clickable,
  className,
  children,
  ...props
}: BadgeInnerProps) => {
  const spinnerTheme = createTheme<DeepPartial<SpinnerTheme>>(
    SPINNER_THEME[color],
  );
  return (
    <div
      className={twMerge(
        'relative flex items-center justify-center px-3 py-2 text-sm font-medium leading-none h-6 whitespace-nowrap',
        COLOR_CLASS[color],
        clickable && !disabled && COLOR_CLASS_CLICKABLE[color],
        square && 'size-6 p-0.5',
        roundedClass,
        rounded && 'size-3 p-3',
        disabled && COLOR_CLASS_DISABLED[color],
        className,
      )}
      {...props}
    >
      {isLoading && (
        <div className='absolute'>
          <Spinner size='sm' theme={spinnerTheme} />
        </div>
      )}
      <span className={twMerge('contents', isLoading && 'invisible')}>
        {children}
      </span>
    </div>
  );
};

export default UdpBadge;
