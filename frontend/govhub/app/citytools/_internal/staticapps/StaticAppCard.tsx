import { StaticApp } from '@/app/_lib/resource-api/staticapps';
import { ReactElement, useActionState, useEffect, useRef } from 'react';
import { manageInstallation } from '@/app/citytools/_internal/staticapps/actions';
import Form from 'next/form';
import {
  FORM_NAMES,
  InstallStaticAppState,
} from '@/app/citytools/_internal/staticapps/form';
import {
  StateDataType,
  StateType,
  UdpCityToolCard,
  UdpToast,
} from 'udp-ui/components';
import CityToolUploadButton from './CityToolUploadButton';
import { cond } from 'lodash';
import { CITYTOOL_CATEGORY_LABELS } from '@/app/citytools/_internal/categories';

const FALLBACK_IMG = '/home/stockgt.jpg';

/* c8 ignore start */
const StaticAppCard = ({
  staticApp,
  staticAppBaseUrl,
  hideInstallButton,
  hideDeleteButton,
  hideUploadButton,
  isCitytoolAdmin,
  tenant,
}: {
  staticApp: StaticApp;
  staticAppBaseUrl: string;
  hideInstallButton?: boolean;
  hideDeleteButton?: boolean;
  hideUploadButton?: boolean;
  isCitytoolAdmin?: boolean;
  tenant: string;
}) => {
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
        staticApp={staticApp}
        staticAppBaseUrl={staticAppBaseUrl}
        hideInstallButton={hideInstallButton}
        hideDeleteButton={hideDeleteButton}
        hideUploadButton={hideUploadButton}
        isCityToolAdmin={isCitytoolAdmin}
        tenant={tenant}
      />
    </Form>
  );
};
/* c8 ignore stop */

const FormContent = ({
  state,
  isLoading,
  submitForm,
  staticApp,
  staticAppBaseUrl,
  hideInstallButton,
  hideDeleteButton,
  hideUploadButton,
  isCityToolAdmin,
  tenant,
}: {
  state: InstallStaticAppState;
  isLoading: boolean;
  submitForm: () => void;
  staticApp: StaticApp;
  staticAppBaseUrl: string;
  hideInstallButton?: boolean;
  hideDeleteButton?: boolean;
  hideUploadButton?: boolean;
  isCityToolAdmin?: boolean;
  tenant: string;
}) => {
  const mode = staticApp.isInstalled ? 'uninstall' : 'install';

  useEffect(() => {
    if (state.isInitial) return;

    const errorToast = UdpToast(
      `Aktion konnte nicht durchgeführt werden.\n${state.errors?.general?.join('\n') ?? ''}`,
      'error',
    );
    const successToast = UdpToast(
      staticApp.isInstalled
        ? 'Citytool wurde installiert.'
        : 'Citytool wurde deinstalliert.',
      'success',
    );
    cond([
      [() => !!state.errors, errorToast],
      [() => !!state.data && !state.errors, successToast],
    ])();
  }, [staticApp.isInstalled, state, mode]);

  const staticAppUrl =
    staticApp.isInstalled && staticApp.finalPath
      ? `${staticAppBaseUrl}/${staticApp.finalPath}`
      : undefined;

  const categoryLabels = staticApp.meta.categories.map(
    (c) => CITYTOOL_CATEGORY_LABELS[c],
  );

  return (
    <>
      <input type='hidden' name={FORM_NAMES.name} value={staticApp.name} />
      <input type='hidden' name={FORM_NAMES.mode} value={mode} />
      <UdpCityToolCard
        title={staticApp.meta.displayName}
        description={staticApp.meta.description}
        pictureUri={staticApp.meta.pictureUri}
        fallbackImage={FALLBACK_IMG}
        categories={categoryLabels}
        href={staticAppUrl}
        target='_blank'
        isLoading={isLoading}
        state={mkState(staticApp, submitForm, isCityToolAdmin)}
        hideInstallButton={hideInstallButton}
        hideDeleteButton={hideDeleteButton}
        hideUploadButton={hideUploadButton}
        installation={mkInstallation(staticApp.overallInstalls.count)}
        removeBadge={mkRemoveAction(staticApp, submitForm)}
        uploadButton={uploadButton(staticApp, tenant)}
        creator='static-app'
        creatorTooltip='Statische App'
      />
    </>
  );
};

const uploadButton: (staticApp: StaticApp, tenant: string) => ReactElement = (
  staticApp: StaticApp,
  tenant: string,
) =>
  staticApp.isInstalled ? (
    <CityToolUploadButton
      bucket={`ct.${tenant}.${staticApp.name}`}
      title={`${staticApp.meta.displayName} hochladen`}
      replace={false}
    />
  ) : (
    <></>
  );

const mkState: (
  staticApp: StaticApp,
  onInstall: () => void,
  isCityToolAdmin?: boolean,
) => StateDataType = (
  staticApp: StaticApp,
  onInstall: () => void,
  isCityToolAdmin?: boolean,
) =>
  staticApp.isInstalled
    ? {
        type: 'installed' as StateType,
        typeText: 'Installiert',
      }
    : isCityToolAdmin
      ? {
          type: 'installable' as StateType,
          typeText: 'Installieren',
          onClick: onInstall,
        }
      : {
          type: 'request' as StateType,
          typeText: 'Zugriff anfordern',
          href: `/community?path=${encodeURIComponent(staticApp.requestCityToolLink)}`,
        };

const mkInstallation = (count: number | undefined) => {
  if (count == undefined) return undefined;
  return {
    count: count,
    countToText: (count: number) =>
      `${count} ${count == 1 ? 'Installation' : 'Installationen'}`,
  };
};

const mkRemoveAction = (staticApp: StaticApp, action: () => void) =>
  staticApp.isInstalled
    ? { action: action, tooltipText: 'City Tool deinstallieren' }
    : undefined;

export default StaticAppCard;

export const internal = {
  FormContent,
};
