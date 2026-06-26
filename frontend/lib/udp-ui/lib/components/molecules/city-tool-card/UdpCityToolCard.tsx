'use client';

import {
  IcArrowUpRightFromSquareSolid,
  IcCity,
  IcCube,
  IcEdit,
  IcEnvelope,
  IcGlobe,
  IcPerson,
  IcTrash,
  UdpBadge,
  UdpBadgeGroup,
  UdpButton,
  UdpClientModal,
} from '@/lib/components';
import { twMerge } from 'tailwind-merge';
import { createTheme, Tooltip as TooltipFlowbite } from 'flowbite-react';
import React, {
  ComponentPropsWithoutRef,
  ElementType,
  MouseEventHandler,
  ReactElement,
} from 'react';
import { UdpCityToolCardTestIds as TestIds } from '@/lib/components/molecules/city-tool-card/testIds.ts';
import {
  UdpBadgeColor,
  UdpBadgeProps,
} from '@/lib/components/atoms/badge/UdpBadge.tsx';
import ScrollFade from '@/lib/components/molecules/city-tool-card/_internal/ScrollFade.tsx';

const FOCUS_RING_CLASS =
  'p-1 focus:rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary-300';

export const BadgeStateType = ['installed', 'warning'] as const;
type BadgeStateType = (typeof BadgeStateType)[number];
const BadgeStateColorMap: Readonly<Record<BadgeStateType, UdpBadgeColor>> = {
  installed: 'success',
  warning: 'warning',
};
export const StateType = ['installable', 'request', ...BadgeStateType] as const;
export type StateType = (typeof StateType)[number];

export type StateDataType = {
  type: StateType;
  typeText: string;
  href?: string;
  onClick?: () => void;
  render?: (
    defaultTrigger: ReactElement<{
      onClick: MouseEventHandler<HTMLElement>;
    }>,
  ) => ReactElement;
};

type ContactDataType = {
  mail: string;
  prefixText: string;
};

type InstallationDataType = {
  count: number;
  countToText: (count: number) => string;
};

type ActionBadgeType = {
  action?: () => void;
  tooltipText?: string;
  as?: ElementType;
  href?: string;
};

export type CreatorType =
  | 'static-app'
  | 'my-shared-app'
  | 'public-shared-app'
  | 'dedicated-app';

export type UdpCityToolCardProps = Partial<
  Pick<ComponentPropsWithoutRef<'a'>, 'href' | 'target'>
> & {
  title: string;
  description: string;
  pictureUri?: string;
  fallbackImage: string;
  categories: string[];
  as?: ElementType;
  isLoading?: boolean;
  state?: StateDataType;
  hideInstallButton?: boolean;
  hideContactButton?: boolean;
  hideDeleteButton?: boolean;
  hideUploadButton?: boolean;
  contact?: ContactDataType;
  installation?: InstallationDataType;
  editBadge?: ActionBadgeType;
  removeBadge?: ActionBadgeType;
  uploadButton?: ReactElement;
  actionSlot?: ReactElement;
  creator?: CreatorType;
  creatorTooltip?: string;
  className?: string;
};

const UdpCityToolCard = ({
  title,
  description,
  pictureUri,
  fallbackImage,
  categories,
  as = 'a',
  href,
  target,
  isLoading,
  state,
  hideInstallButton,
  hideContactButton,
  hideDeleteButton,
  hideUploadButton,
  contact,
  installation,
  editBadge,
  removeBadge,
  uploadButton,
  actionSlot,
  creator,
  creatorTooltip,
  className,
}: UdpCityToolCardProps) => (
  <div
    className={twMerge(
      'bg-white flex flex-col rounded-2xl shadow-lg',
      className,
    )}
    data-testid={TestIds.self}
  >
    <CardHeader
      title={title}
      categories={categories}
      href={href}
      target={target}
      as={as}
      state={state}
      hideInstallButton={hideInstallButton}
      isLoading={isLoading}
    />
    <CardImage pictureUri={pictureUri} fallbackImage={fallbackImage} />
    <CardFooter
      title={title}
      description={description}
      pictureUri={pictureUri}
      contact={contact}
      hideContactButton={hideContactButton}
      installation={installation}
      editBadge={editBadge}
      removeBadge={removeBadge}
      uploadButton={uploadButton}
      actionSlot={actionSlot}
      creator={creator}
      creatorTooltip={creatorTooltip}
      isLoading={isLoading}
      hideDeleteButton={hideDeleteButton}
      hideUploadButton={hideUploadButton}
    />
  </div>
);

type CardHeaderProps = {
  title: string;
  categories: string[];
  state?: StateDataType;
  isLoading?: boolean;
} & Pick<UdpCityToolCardProps, 'href' | 'target' | 'as' | 'hideInstallButton'>;

const CardHeader = ({
  title,
  categories,
  state,
  hideInstallButton,
  isLoading,
  href,
  target,
  as: LinkComp = 'a',
}: CardHeaderProps) => {
  const Wrapper = href ? LinkComp : 'div';
  return (
    <div className='flex flex-col gap-2.5 p-6 shrink-0 overflow-hidden'>
      <div className='flex justify-between gap-4 items-center'>
        <Wrapper
          className={twMerge(
            'flex gap-1 items-center text-primary-700 truncate group',
            href && twMerge('hover:text-primary-500', FOCUS_RING_CLASS),
          )}
          href={href}
          target={target}
          data-testid={TestIds.title}
        >
          <h2 className='text-xl font-bold truncate'>{title}</h2>
          {href && (
            <IcArrowUpRightFromSquareSolid className='invisible group-hover:visible group-focus:visible size-6 shrink-0' />
          )}
        </Wrapper>
        {state && (
          <ActionButton
            state={state}
            hideInstallButton={hideInstallButton}
            isLoading={isLoading}
          />
        )}
      </div>
      {categories.length > 0 && (
        <ScrollFade data-testid={TestIds.categories}>
          <UdpBadgeGroup labels={categories} scrollable />
        </ScrollFade>
      )}
    </div>
  );
};

const ActionButton = ({
  isLoading,
  state,
  hideInstallButton,
}: Pick<UdpCityToolCardProps, 'isLoading' | 'hideInstallButton'> & {
  state: StateDataType;
}) => {
  if (state.type === 'installable' && hideInstallButton) return null;

  const defaultTrigger = (() => {
    switch (state.type) {
      case 'installable':
        return (
          <UdpButton
            onClick={performAction(state.onClick ?? (() => {}))}
            loading={isLoading}
            data-testid={TestIds.installButton}
          >
            {state.typeText}
          </UdpButton>
        );
      case 'request':
        return (
          <UdpButton
            href={state.href ?? ''}
            loading={isLoading}
            data-testid={TestIds.requestButton}
          >
            {state.typeText}
          </UdpButton>
        );

      default:
        return (
          <UdpBadge
            color={BadgeStateColorMap[state.type]}
            onClick={performAction(state.onClick)}
            data-testid={TestIds.stateBadge}
          >
            {state.typeText}
          </UdpBadge>
        );
    }
  })();

  return (
    <div className='h-10.5 flex items-center'>
      {state.render ? state.render(defaultTrigger) : defaultTrigger}
    </div>
  );
};

type CardImageProps = {
  pictureUri?: string;
  fallbackImage: string;
};

const CardImage = ({ pictureUri, fallbackImage }: CardImageProps) => (
  <div className='relative flex-[1_0_0] min-h-40 w-full overflow-hidden'>
    {pictureUri ? (
      <img
        src={pictureUri}
        alt=''
        className='absolute inset-0 size-full max-w-none object-cover pointer-events-none'
        aria-hidden='true'
      />
    ) : (
      <div aria-hidden='true' className='absolute inset-0 pointer-events-none'>
        <img
          src={fallbackImage}
          alt=''
          className='absolute size-full max-w-none object-cover'
        />
        <div className='absolute inset-0 bg-gray-100/60' />
      </div>
    )}
  </div>
);

type ModalDataType = {
  title: string;
  description: string;
  pictureUri?: string;
};

const CardDetailsModal = ({
  title,
  description,
  pictureUri,
}: ModalDataType) => (
  <UdpClientModal
    title={title}
    size='3xl'
    content={() => (
      <DetailsContent description={description} pictureUri={pictureUri} />
    )}
  >
    <UdpButton
      color='tertiary'
      className={twMerge(
        'hover:bg-transparent active:bg-transparent hover:text-primary-500',
        FOCUS_RING_CLASS,
      )}
      data-testid={TestIds.moreDetailsButton}
    >
      Details anzeigen
    </UdpButton>
  </UdpClientModal>
);

const DetailsContent = ({
  description,
  pictureUri,
}: {
  description: string;
  pictureUri?: string;
}) => (
  <div className='flex flex-col gap-5' data-testid={TestIds.moreDetailsContent}>
    <div className='rounded-lg w-full max-h-[300px] overflow-hidden flex items-center'>
      {pictureUri && (
        <img
          src={pictureUri}
          alt='City Tool picture'
          className='w-full object-cover'
        />
      )}
    </div>
    <p className='h-full min-h-30'>{description}</p>
  </div>
);

type CardFooterProps = {
  title: string;
  description: string;
  pictureUri?: string;
  contact?: ContactDataType;
  hideContactButton?: boolean;
  installation?: InstallationDataType;
  editBadge?: ActionBadgeType;
  removeBadge?: ActionBadgeType;
  uploadButton?: ReactElement;
  actionSlot?: ReactElement;
  creator?: CreatorType;
  creatorTooltip?: string;
  isLoading?: boolean;
  hideDeleteButton?: boolean;
  hideUploadButton?: boolean;
};

const CardFooter = ({
  title,
  description,
  pictureUri,
  contact,
  hideContactButton = false,
  installation,
  editBadge,
  removeBadge,
  uploadButton,
  actionSlot,
  creator,
  creatorTooltip,
  isLoading,
  hideDeleteButton,
  hideUploadButton,
}: CardFooterProps) => (
  <div className='min-h-11 h-11 px-6 flex gap-4 justify-between items-center text-primary-300 text-sm shrink-0'>
    <div className='h-full flex items-center truncate'>
      {installation && <InstallationParagraph {...installation} />}
    </div>
    <div className='flex gap-2.5 items-center'>
      <CardDetailsModal
        title={title}
        description={description}
        pictureUri={pictureUri}
      />
      {creator &&
        (creatorTooltip ? (
          <TooltipFlowbite content={creatorTooltip} placement='bottom'>
            <CreatorIcon creator={creator} />
          </TooltipFlowbite>
        ) : (
          <CreatorIcon creator={creator} />
        ))}
      {contact && !hideContactButton && (
        <TooltipFlowbite
          content={`${contact.prefixText} ${contact.mail}`}
          placement='bottom'
        >
          <UdpBadge
            href={`mailto:${contact.mail}`}
            square
            data-testid={TestIds.contactBadge}
          >
            <IcEnvelope className='size-4.5' />
          </UdpBadge>
        </TooltipFlowbite>
      )}
      {editBadge && (
        <ActionBadge data={editBadge} data-testid={TestIds.editBadge}>
          <IcEdit className='size-5' />
        </ActionBadge>
      )}
      {creator == 'static-app' && !hideUploadButton && uploadButton}
      {removeBadge && !hideDeleteButton && (
        <ActionBadge
          color='danger'
          data={removeBadge}
          loading={isLoading}
          data-testid={TestIds.removeBadge}
        >
          <IcTrash className='size-4.5' />
        </ActionBadge>
      )}
      {actionSlot}
    </div>
  </div>
);

const CreatorIcon = ({ creator }: { creator: CreatorType }) => {
  const props = {
    className: 'aspect-square size-4.5',
    'data-testid': TestIds.creatorIcon,
  };
  switch (creator) {
    case 'static-app':
      return <IcPerson {...props} />;
    case 'my-shared-app':
      return <IcCity {...props} />;
    case 'public-shared-app':
      return <IcGlobe {...props} />;
    case 'dedicated-app':
      return <IcCube {...props} />;
  }
};

const InstallationParagraph = (installation: InstallationDataType) => (
  <p
    className='text-primary-300 text-sm truncate'
    data-testid={TestIds.installCount}
  >
    {installation.countToText(installation.count)}
  </p>
);

const performAction = (action?: () => void) => {
  if (!action) return undefined;
  return (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };
};

type ActionBadgeProps = UdpBadgeProps & { data: ActionBadgeType };

const ActionBadge = ({ data, children, ...restProps }: ActionBadgeProps) => {
  const Tooltip = data.tooltipText ? TooltipFlowbite : 'div';
  return (
    <Tooltip
      content={data.tooltipText}
      placement='bottom'
      className='grow'
      theme={createTheme({ base: 'max-w-96', target: 'flex' })}
    >
      <UdpBadge
        linkAs={data.as}
        href={data.href}
        className='cursor-pointer'
        square
        onClick={performAction(data.action)}
        {...restProps}
      >
        {children}
      </UdpBadge>
    </Tooltip>
  );
};

export default UdpCityToolCard;
