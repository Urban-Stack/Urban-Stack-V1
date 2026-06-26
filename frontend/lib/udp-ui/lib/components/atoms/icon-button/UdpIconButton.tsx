import { ButtonHTMLAttributes } from 'react';
import { UdpIcon } from '@/lib/components/icons';
import { twMerge } from 'tailwind-merge';

export interface UdpIconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  icon: UdpIcon;
  /* Human-readable description used for screen-reader  */
  label: string;
  color?: ButtonColor;
  /* Css class applied to the icon */
  classIcon?: string;
}

export const UdpIconButtonColor = ['primary', 'light', 'tertiary'] as const;
type ButtonColor = (typeof UdpIconButtonColor)[number];

const colorMapping: Record<ButtonColor, string> = {
  primary: 'text-primary-700 hover:text-primary-500 active:text-primary-500 ',
  light: 'text-white hover:text-primary-100 active:text-primary-200',
  tertiary:
    'bg-transparent text-gray-800 hover:text-gray-600 border border-gray-200',
};

const defaultClassNames =
  'align-middle focus:ring-2 focus:ring-primary-200 focus:outline-hidden focus:border-transparent rounded-lg';

const UdpIconButton = ({
  icon: Icon,
  color = 'primary',
  className,
  classIcon,
  ...propsRest
}: UdpIconButtonProps) => {
  const colorClass = colorMapping[color];
  return (
    <button
      {...propsRest}
      className={twMerge(defaultClassNames, colorClass, className)}
    >
      <Icon className={classIcon} />
      <span className='sr-only'>{propsRest.label}</span>
    </button>
  );
};

export default UdpIconButton;
