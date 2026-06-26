import { StateDataType, StateType, UdpCityToolCard } from 'udp-ui/components';
import { SharedApp } from '@/app/_lib/resource-api/sharedapps/internal';
import Link from 'next/link';
import { mkHref } from '@/app/citytools/shared-app/util';
import React, { MouseEventHandler, ReactElement } from 'react';
import DeleteBadge from '@/app/citytools/_internal/sharedapps/DeleteBadge';
import ContainerLogsModal from '@/app/citytools/_internal/ContainerLogsModal';
import { useContainerInfo } from '@/app/_lib/resource-api/sharedapps/client';
import { CITYTOOL_CATEGORY_LABELS } from '@/app/citytools/_internal/categories';

const FALLBACK_IMG = '/home/stockgt.jpg';

const SharedAppCard = ({
  tenant,
  sharedApp,
  hideAdminElems,
}: {
  tenant: string;
  sharedApp: SharedApp;
  hideAdminElems?: boolean;
}) => {
  const categoryLabels = sharedApp.categories.map(
    (c) => CITYTOOL_CATEGORY_LABELS[c],
  );
  return (
    <UdpCityToolCard
      title={sharedApp.displayName}
      description={sharedApp.description}
      pictureUri={sharedApp.pictureUri}
      fallbackImage={FALLBACK_IMG}
      categories={categoryLabels}
      href={sharedApp.url}
      target='_blank'
      state={mkState(tenant, sharedApp, hideAdminElems)}
      creator='my-shared-app'
      creatorTooltip='Von meiner Stadt erstellt'
      editBadge={
        hideAdminElems
          ? undefined
          : {
              href: mkHref(tenant, sharedApp.name),
              tooltipText: 'Shared App bearbeiten',
              as: Link,
            }
      }
      actionSlot={
        hideAdminElems ? undefined : (
          <DeleteBadge
            tenant={tenant}
            name={sharedApp.name}
            displayName={sharedApp.displayName}
          />
        )
      }
      hideDeleteButton={hideAdminElems}
      contact={{ prefixText: 'Ansprechpartner', mail: sharedApp.adminContact }}
    />
  );
};

const mkState: (
  tenant: string,
  sharedApp: SharedApp,
  hideAdminElems?: boolean,
) => StateDataType = (tenant, sharedApp, hideAdminElems) => {
  const render = hideAdminElems
    ? undefined
    : (
        defaultTrigger: ReactElement<{
          onClick: MouseEventHandler<HTMLElement>;
        }>,
      ) => (
        <ContainerLogsModal
          tenant={tenant}
          appName={sharedApp.name}
          useContainerInfo={useContainerInfo}
        >
          {defaultTrigger}
        </ContainerLogsModal>
      );
  return sharedApp.status === 'running'
    ? {
        type: 'installed' as StateType,
        typeText: 'Installiert',
        render,
      }
    : {
        type: 'warning' as StateType,
        typeText: 'Warnung',
        render,
      };
};

export default SharedAppCard;
