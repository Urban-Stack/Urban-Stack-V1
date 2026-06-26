import React from 'react';
import { type UdpIcon } from '@/lib/components/icons';
import { twMerge } from 'tailwind-merge';

export interface UdpFallbackProps {
  icon: UdpIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Fallback component comprising an icon, a title and a description.
 * <p>
 * This component is supposed to be used as a fallback in case the intended visualization cannot take place (e.g. no entries found).
 * <p>
 * The `description` as well as the `title` can be divided into separate lines by means of explicit line breaks `\n` or using Template Literals.
 *
 * @param icon        type or component of the icon for this fallback component
 * @param title       title for this fallback component
 * @param description description for this fallback component (include `\n` for line breaks or use Template Literals)
 * @param children    child components for this fallback component
 * @param className   class name for this fallback component
 * @param restProps   additional properties for this fallback component
 * @constructor
 */
const UdpFallback = ({
  icon,
  title,
  description,
  children,
  className,
  ...restProps
}: UdpFallbackProps) => (
  <div
    className={twMerge('flex flex-col gap-y-5 items-center', className)}
    {...restProps}
  >
    <div className={'flex flex-col gap-y-4 items-center'}>
      <FallbackIcon icon={icon} />
      <FallbackText title={title} description={description} />
    </div>
    {children}
  </div>
);

export default UdpFallback;

const FallbackIcon = ({ icon }: { icon: UdpIcon }) => icon({});

const FallbackText = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className='flex flex-col gap-y-1 text-gray-400 leading-5 text-center whitespace-pre-line'>
    <span className={'font-semibold'}>{title}</span>
    <span className={'font-normal'}>{description}</span>
  </div>
);
