import { Spinner } from 'flowbite-react';
import { twMerge } from 'tailwind-merge';

export const UdpSpinnerTestId = 'udp-spinner';

/**
 * Spinner for indicating a loading status.
 *
 * @param className class name for this spinner
 * @constructor
 */
const UdpSpinner = ({ className }: { className?: string }) => (
  <Spinner
    className={twMerge('fill-primary-500 w-16 h-16', className)}
    data-testid={UdpSpinnerTestId}
  />
);

export default UdpSpinner;
