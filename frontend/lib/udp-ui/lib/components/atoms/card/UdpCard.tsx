import React from 'react';
import { twMerge } from 'tailwind-merge';
import { UdpCardTestIds } from '@/lib/components/atoms/card/testIds';
import { UdpIcon } from '@/lib/components';

export const UdpCardColor = [
  'primary',
  'success',
  'warning',
  'danger',
] as const;

export type UdpCardColor = (typeof UdpCardColor)[number];

export interface UdpCardProps extends React.ComponentProps<'div'> {
  title?: string;
  icon?: UdpIcon;
  description?: string;
  color?: UdpCardColor;
}

const CARD_COLOR_STYLES: Record<UdpCardColor, string> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
};

const UdpCard = ({
  title,
  icon: Icon,
  description,
  color = 'primary',
  className,
  children,
  ref,
  ...rest
}: UdpCardProps) => (
  <div
    ref={ref}
    className={twMerge(
      'rounded-lg p-4 flex flex-col gap-2 text-wrap',
      CARD_COLOR_STYLES[color],
      className,
    )}
    data-testid={UdpCardTestIds.self}
    {...rest}
  >
    {(title || description) && (
      <div
        className='flex flex-col items-start gap-1'
        data-testid={UdpCardTestIds.header}
      >
        {title && (
          <div className='flex gap-2 items-center min-w-0'>
            {Icon && (
              <Icon data-testid={UdpCardTestIds.icon} className='size-4' />
            )}
            {title && (
              <h3 className='font-semibold' data-testid={UdpCardTestIds.title}>
                {title}
              </h3>
            )}
          </div>
        )}

        {description && (
          <p className='text-sm' data-testid={UdpCardTestIds.description}>
            {description}
          </p>
        )}
      </div>
    )}
    <div data-testid={UdpCardTestIds.content}>{children}</div>
  </div>
);

UdpCard.displayName = 'UdpCard';

export default UdpCard;
