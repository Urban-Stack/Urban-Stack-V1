import React, { RefObject } from 'react';
import { twMerge } from 'tailwind-merge';
import { UdpIcon } from '@/lib/components/icons/icon.ts';
import { createTheme, Spinner, SpinnerTheme } from 'flowbite-react';
import { DeepPartial } from 'flowbite-react/types';
import { UdpButtonTestIds } from '@/lib/components/atoms/button/testIds.ts';
import { COLOR_CLASS } from '@/lib/components/atoms/button/util.ts';
import { SPINNER_THEME } from '@/lib/components/atoms/spinner/theme.ts';

export const UdpButtonColor = [
  'primary',
  'secondary',
  'tertiary',
  'success',
  'warning',
  'danger',
] as const;
export type UdpButtonColor = (typeof UdpButtonColor)[number];

export interface UdpButtonProps extends Partial<
  Pick<
    React.ComponentPropsWithoutRef<'a'> &
      React.ComponentPropsWithoutRef<'button'>,
    | 'href'
    | 'target'
    | 'className'
    | 'children'
    | 'onClick'
    | 'type'
    | 'role'
    | 'aria-checked'
    | 'disabled'
  >
> {
  color?: UdpButtonColor;
  icon?: UdpIcon;
  linkAs?: React.ElementType;
  loading?: boolean;
  srTextLoading?: string;
  disabled?: boolean;
  ref?: RefObject<HTMLElement>;
}

const defaultClass: string =
  'flex p-2.5 font-medium text-sm rounded-lg focus:outline-hidden focus:ring-3 cursor-pointer disabled:cursor-not-allowed';

const UdpButton = ({
  color = 'primary',
  icon: Icon,
  children,
  href,
  onClick,
  disabled = false,
  loading = false,
  srTextLoading = 'Wird verarbeitet',
  type = 'button',
  linkAs: LinkComp,
  className,
  ref,
  ...restProps
}: UdpButtonProps) => {
  const isLink = href && !disabled;

  const finalProps = {
    className: twMerge(defaultClass, COLOR_CLASS[color], className),
    ...restProps,
    disabled: !isLink && (disabled || loading),
    'data-loading': loading,
    'aria-busy': loading,
    'aria-label': loading ? srTextLoading : undefined,
  };

  const content = (
    <ButtonContent
      loading={!isLink && !disabled && loading}
      srTextLoading={srTextLoading}
      color={color}
      icon={Icon}
    >
      {children}
    </ButtonContent>
  );
  return isLink ? (
    LinkComp ? (
      <LinkComp href={href} role='button' {...finalProps} ref={ref}>
        {content}
      </LinkComp>
    ) : (
      <a
        href={href}
        role='button'
        ref={ref as RefObject<HTMLAnchorElement>}
        {...finalProps}
      >
        {content}
      </a>
    )
  ) : (
    <button
      type={type}
      onClick={onClick}
      ref={ref as RefObject<HTMLButtonElement>}
      {...finalProps}
    >
      {content}
    </button>
  );
};

export default UdpButton;

const ButtonContent = ({
  icon: Icon,
  loading,
  srTextLoading,
  color,
  children,
}: {
  icon?: UdpIcon;
  loading: boolean;
  srTextLoading: string;
  color: UdpButtonColor;
  children: React.ReactNode;
}) => {
  const theme = createTheme<DeepPartial<SpinnerTheme>>(SPINNER_THEME[color]);
  return (
    <div className='relative flex items-center gap-1'>
      {loading && (
        <span className='sr-only' aria-live='polite'>
          {srTextLoading}
        </span>
      )}
      {Icon && (
        <div
          className={twMerge(
            'flex items-center size-5',
            loading ? 'invisible' : '',
          )}
        >
          <Icon />
        </div>
      )}
      {loading && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <Spinner
            size='sm'
            theme={theme}
            data-testid={UdpButtonTestIds.spinner}
          />
        </div>
      )}
      <div className={twMerge('px-1 empty:hidden', loading ? 'invisible' : '')}>
        {children}
      </div>
    </div>
  );
};
