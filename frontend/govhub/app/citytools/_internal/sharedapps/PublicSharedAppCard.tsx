import { type CreatorType, UdpCityToolCard } from 'udp-ui/components';
import { PublicSharedApp } from '@/app/_lib/resource-api/sharedapps/internal';
import { CITYTOOL_CATEGORY_LABELS } from '@/app/citytools/_internal/categories';

const FALLBACK_IMG = '/home/stockgt.jpg';

/* c8 ignore start */
const PublicSharedAppCard = ({
  publicSharedApp,
  currentTenant,
}: {
  publicSharedApp: PublicSharedApp;
  currentTenant: string;
}) => (
  <FormContent
    currentTenant={currentTenant}
    publicSharedApp={publicSharedApp}
  />
);
/* c8 ignore stop */

const FormContent = ({
  publicSharedApp,
  currentTenant,
}: {
  publicSharedApp: PublicSharedApp;
  currentTenant: string;
}) => {
  const creator: CreatorType =
    currentTenant === publicSharedApp.tenant
      ? 'my-shared-app'
      : 'public-shared-app';
  const creatorTooltip =
    currentTenant === publicSharedApp.tenant
      ? 'Von meiner Stadt erstellt'
      : 'Von einer anderen Stadt erstellt';
  const categoryLabels = publicSharedApp.categories.map(
    (c) => CITYTOOL_CATEGORY_LABELS[c],
  );
  return (
    <UdpCityToolCard
      title={publicSharedApp.displayName}
      description={publicSharedApp.description}
      pictureUri={publicSharedApp.pictureUri}
      fallbackImage={FALLBACK_IMG}
      categories={categoryLabels}
      href={publicSharedApp.url}
      target='_blank'
      creator={creator}
      creatorTooltip={creatorTooltip}
      hideDeleteButton
      hideInstallButton
      contact={{
        prefixText: 'Ansprechpartner',
        mail: publicSharedApp.adminContact,
      }}
    />
  );
};

export default PublicSharedAppCard;

export const internal = {
  FormContent,
};
