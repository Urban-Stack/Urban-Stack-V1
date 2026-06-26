import { twMerge } from 'tailwind-merge';
import { UdpToggleIconButton } from '@/lib/components/atoms/toggle-icon-button';
import {
  IcDashboardFallback,
  IcGlobe,
  IcLock,
  IcStar,
  UdpIcon,
} from '@/lib/components/icons';
import { UdpThumbnail } from '@/lib/components/atoms/thumbnail';
import { UdpBadgeGroup } from '@/lib/components/atoms';
import { UdpDashboardCardTestIds } from '@/lib/components/molecules/dashboard-card/testIds';
import { ElementType } from 'react';
import { Tooltip } from 'flowbite-react';

export type DashboardPublicStatus = 'published' | 'intern';

interface UdpDashboardCardProps {
  href: string;
  as?: ElementType;
  src?: string;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  info?: string;
  fallbackTitle: string;
  tags?: Array<string>;
  isFavorite?: boolean;
  hideFavorite?: boolean;
  publicStatus?: DashboardPublicStatus;
  publicStatusTooltips?: Readonly<Record<DashboardPublicStatus, string>>;
  onFavoriteChange?: () => void;
  className?: string;
}

const borderRadius = 'rounded-xl';

/**
 * Card representing a Superset Dashboard.
 *
 * @param href             hypertext reference for this card
 * @param as               component to use for the link - defaults to `a` if not given
 * @param src              source of the thumbnail image of the Dashboard to represent by means of this card, or
 *                         `undefined` if the thumbnail is not (yet) available
 * @param isLoading        `true` if the thumbnail to represent by means of this component is still loading - `false` otherwise
 * @param title            title of the Dashboard to represent by means of this card
 * @param subtitle         subtitle of the Dashboard
 * @param info             additional information of the Dashboard
 * @param fallbackTitle    fallback title to show if no `title` is given
 * @param tags             list of tag names of the Dashboard to represent by means of this card
 * @param isFavorite       `true` in order to mark the Dashboard as being favored, or
 *                         `false` in order to mark the Dashboard as not being favored, or
 *                         `undefined` in order to let this card handle the favor status itself (starting from an inactive state)
 * @param hideFavorite     `true` in order to hide the favorite button
 * @param onFavoriteChange callback function invoked on any change of the favorite status
 * @param className        class name for this card
 * @constructor
 */
const UdpDashboardCard = ({
  href,
  as: LinkComp = 'a',
  src,
  isLoading,
  title,
  subtitle,
  info,
  fallbackTitle,
  tags = [],
  isFavorite = false,
  hideFavorite = false,
  publicStatus,
  publicStatusTooltips,
  onFavoriteChange,
  className,
}: UdpDashboardCardProps) => (
  <div
    className={twMerge('relative hover:shadow-lg', borderRadius, className)}
    data-testid={UdpDashboardCardTestIds.self}
  >
    <div
      className={twMerge(
        'h-full bg-white border border-gray-100 cursor-pointer shadow-md active:shadow-none',
        borderRadius,
      )}
    >
      <LinkComp
        href={href}
        className={
          'flex flex-col gap-1.5 p-1.5 h-full focus:rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary-300'
        }
      >
        <UdpThumbnail
          className={'rounded-lg h-48'}
          src={src}
          isLoading={isLoading}
          altImage={IcDashboardFallback}
          classAlt={'bg-neutral-100 fill-white'}
        />
        <DataContent
          title={title ?? fallbackTitle}
          subtitle={subtitle}
          info={info}
          className={title ? 'text-gray-900' : 'text-gray-500'}
          tags={tags}
          publicStatus={publicStatus}
          tooltips={publicStatusTooltips}
        />
      </LinkComp>
    </div>
    {!hideFavorite && (
      <UdpToggleIconButton
        outlineIcon={IcStar}
        active={isFavorite}
        onChange={onFavoriteChange}
        className={'w-8 h-8 absolute top-3 right-3 bg-white p-1'}
        data-testid={UdpDashboardCardTestIds.favButton}
      />
    )}
  </div>
);

export default UdpDashboardCard;

const publicStatusIcons: Readonly<Record<DashboardPublicStatus, UdpIcon>> = {
  published: IcGlobe,
  intern: IcLock,
};
const classMapping: Readonly<Record<DashboardPublicStatus, string>> = {
  published: 'text-primary-700',
  intern: 'text-primary-200',
};

const PublicIcon = ({
  status,
  tooltips,
}: {
  status: DashboardPublicStatus;
  tooltips?: Readonly<Record<DashboardPublicStatus, string>>;
}) => {
  const Icon = publicStatusIcons[status];
  const iconElem = <Icon className={twMerge('size-4', classMapping[status])} />;
  return tooltips ? (
    <Tooltip content={tooltips[status]}>{iconElem}</Tooltip>
  ) : (
    iconElem
  );
};

const DataContent = ({
  title,
  subtitle,
  info,
  publicStatus,
  tooltips,
  tags,
  className,
}: {
  title: string;
  subtitle?: string;
  info?: string;
  publicStatus?: DashboardPublicStatus;
  tooltips?: Readonly<Record<DashboardPublicStatus, string>>;
  tags: string[];
  className?: string;
}) => (
  <div className={twMerge('flex flex-col px-3.5 py-3 gap-2.5', className)}>
    <div className='flex flex-col'>
      {subtitle && (
        <div className='flex justify-between items-center gap-2.5'>
          <p className='truncate text-sm'>{subtitle}</p>
          {publicStatus && (
            <PublicIcon status={publicStatus} tooltips={tooltips} />
          )}
        </div>
      )}
      <h2 className={'font-bold text-lg truncate'}>{title}</h2>
      {info && <p className='text-gray-500 text-sm'>{info}</p>}
    </div>
    <UdpBadgeGroup labels={tags} />
  </div>
);
