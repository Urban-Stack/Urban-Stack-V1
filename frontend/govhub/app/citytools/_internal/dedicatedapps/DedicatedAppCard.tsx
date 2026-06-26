import { DedicatedApp } from '@/app/_lib/resource-api/dedicatedapps';
import { StateDataType, UdpCityToolCard, UdpToast } from 'udp-ui/components';
import { CITYTOOL_CATEGORY_LABELS } from '@/app/citytools/_internal/categories';
import {
  MouseEventHandler,
  ReactElement,
  useActionState,
  useEffect,
  useRef,
} from 'react';
import { manageInstallation } from '@/app/citytools/_internal/dedicatedapps/actions';
import {
  FORM_NAMES,
  InstallDedicatedAppState,
  InstallMode,
} from '@/app/citytools/_internal/dedicatedapps/form';
import Form from 'next/form';
import { cond } from 'lodash';
import ContainerLogsModal from '@/app/citytools/_internal/ContainerLogsModal';
import { useContainerInfo } from '@/app/_lib/resource-api/dedicatedapps/client';

type DedicatedAppCardProps = {
  dedicatedApp: DedicatedApp;
  tenant: string;
  hideAdminElems?: boolean;
};

const FALLBACK_IMG = '/home/stockgt.jpg';

/* c8 ignore start */
const DedicatedAppCard = ({
  dedicatedApp,
  tenant,
  hideAdminElems,
}: DedicatedAppCardProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isLoading] = useActionState(manageInstallation, {
    isInitial: true,
  });
  const submitForm = () => formRef.current?.requestSubmit();

  return (
    <Form ref={formRef} action={formAction} className='contents'>
      <FormContent
        state={state}
        isLoading={isLoading}
        submitForm={submitForm}
        dedicatedApp={dedicatedApp}
        tenant={tenant}
        hideAdminElems={hideAdminElems}
      />
    </Form>
  );
};
/* c8 ignore stop */

const FormContent = ({
  dedicatedApp,
  tenant,
  state,
  isLoading,
  submitForm,
  hideAdminElems,
}: DedicatedAppCardProps & {
  state: InstallDedicatedAppState;
  isLoading: boolean;
  submitForm: () => void;
}) => {
  const mode: InstallMode = dedicatedApp.isInstalled ? 'uninstall' : 'install';

  const categories = dedicatedApp.meta.categories.map(
    (c) => CITYTOOL_CATEGORY_LABELS[c],
  );

  useEffect(() => {
    if (state.isInitial) return;

    const errorToast = UdpToast(
      `Aktion konnte nicht durchgeführt werden.\n${state.errors?.general?.join('\n') ?? ''}`,
      'error',
    );
    const successToast = UdpToast(
      dedicatedApp.isInstalled
        ? 'Citytool wurde installiert.'
        : 'Citytool wurde deinstalliert.',
      'success',
    );
    cond([
      [() => !!state.errors, errorToast],
      [() => !!state.data && !state.errors, successToast],
    ])();
  }, [dedicatedApp.isInstalled, state, mode]);

  return (
    <>
      <input type='hidden' name={FORM_NAMES.name} value={dedicatedApp.name} />
      <input type='hidden' name={FORM_NAMES.mode} value={mode} />
      <UdpCityToolCard
        title={dedicatedApp.meta.displayName}
        description={dedicatedApp.meta.description}
        pictureUri={dedicatedApp.meta.pictureUri}
        fallbackImage={FALLBACK_IMG}
        categories={categories}
        href={dedicatedApp.url}
        target='_blank'
        isLoading={isLoading}
        state={mkState(dedicatedApp, tenant, submitForm, hideAdminElems)}
        hideInstallButton={hideAdminElems}
        hideDeleteButton={hideAdminElems}
        removeBadge={mkRemoveAction(dedicatedApp, submitForm)}
        creator='dedicated-app'
        creatorTooltip='Dedizierte App'
      />
    </>
  );
};

const mkState: (
  dedicatedApp: DedicatedApp,
  tenant: string,
  onInstall: () => void,
  hideAdminElems?: boolean,
) => StateDataType = (dedicatedApp, tenant, onInstall, hideAdminElems) => {
  const render = hideAdminElems
    ? undefined
    : (
        defaultTrigger: ReactElement<{
          onClick: MouseEventHandler<HTMLElement>;
        }>,
      ) => (
        <ContainerLogsModal
          tenant={tenant}
          appName={dedicatedApp.name}
          useContainerInfo={useContainerInfo}
        >
          {defaultTrigger}
        </ContainerLogsModal>
      );

  if (dedicatedApp.isInstalled)
    return {
      type: 'installed',
      typeText: 'Installiert',
      render,
    };
  else if (hideAdminElems) {
    return {
      type: 'request',
      typeText: 'Zugriff anfordern',
      href: `/community?path=${encodeURIComponent(dedicatedApp.requestCityToolLink)}`,
    };
  } else {
    return {
      type: 'installable',
      typeText: 'Installieren',
      onClick: onInstall,
    };
  }
};

const mkRemoveAction = (dedicatedApp: DedicatedApp, action: () => void) =>
  dedicatedApp.isInstalled
    ? { action, tooltipText: 'City Tool deinstallieren' }
    : undefined;

DedicatedAppCard.displayName = 'DedicatedAppCard';

export default DedicatedAppCard;

export const internal = {
  FormContent,
};
