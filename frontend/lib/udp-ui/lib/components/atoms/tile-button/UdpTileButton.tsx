import { ButtonHTMLAttributes, ElementType } from 'react';
import { twMerge } from 'tailwind-merge';
import { UdpIcon } from '@/lib/components/icons';
import { TileButtonTestIds } from '@/lib/components/atoms/tile-button/testIds';

interface TileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: UdpIcon;
  label: string;
  className?: string;
  href?: string;
  as?: ElementType;
}

const UdpTileButton = ({
  icon: Icon,
  label,
  className,
  href,
  as: LinkComp = 'a',
}: TileButtonProps) => (
  <LinkComp
    href={href ?? ''}
    className={twMerge(
      'cursor-pointer bg-white hover:bg-primary-100 rounded-xl shadow-xs flex flex-col justify-center items-center gap-3 p-5',
      'focus:rounded-xl focus:outline-hidden focus:ring-3 focus:ring-primary-300',
      className,
    )}
    data-testid={TileButtonTestIds.self}
  >
    <Icon data-testid={TileButtonTestIds.icon} />
    <span className='text-center font-bold whitespace-pre-line'>{label}</span>
  </LinkComp>
);

export default UdpTileButton;
