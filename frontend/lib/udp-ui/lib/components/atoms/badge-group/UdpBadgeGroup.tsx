import { UdpBadge } from '@/lib/components/atoms/badge';
import { twMerge } from 'tailwind-merge';

/**
 * Group of badges.
 * <p>
 * This component is rendered only if any badge label is given.
 *
 * @param labels     texts for the individual badges of this group component
 * @param className  class name for this group component
 * @param classBadge class name for the individual badges of this group component
 * @param scrollable if true, group scrolls instead of wrap
 * @constructor
 */
const UdpBadgeGroup = ({
  labels,
  className,
  classBadge,
  scrollable,
}: {
  labels: Array<string>;
  className?: string;
  classBadge?: string;
  scrollable?: boolean;
}) =>
  labels.length > 0 && (
    <div
      className={twMerge(
        scrollable
          ? 'flex flex-nowrap overflow-x-auto gap-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]'
          : 'flex flex-wrap gap-2',
        className,
      )}
    >
      {labels.map((label) => (
        <UdpBadge className={twMerge('h-6', classBadge)} key={label}>
          {label}
        </UdpBadge>
      ))}
    </div>
  );

export default UdpBadgeGroup;
