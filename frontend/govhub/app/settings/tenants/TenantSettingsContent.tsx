'use client';

import React, { useActionState, useEffect } from 'react';
import {
  IcSave,
  UdpButton,
  UdpColorPicker,
  UdpImageInput,
  UdpTextInput,
  UdpToast,
} from 'udp-ui/components';
import Form from 'next/form';
import { FORM_NAMES, TenantSettingsState } from '@/app/settings/tenants/form';
import { updateTenantSettings } from '@/app/settings/tenants/actions';
import { TenantSettings } from '@/app/_lib/resource-api/graphql/attributes';
import { parseCoords } from '@/app/_lib/misc/misc';

export const TenantSettingsTestIds = {
  name: 'tenant-name-input',
  legalNoticeUrl: 'legal-notice-url',
  privacyUrl: 'privacy-url',
  contactUrl: 'contact-url',
  logo: 'tenant-logo-input',
  image: 'tenant-image-input',
  citizenHubImage: 'citizen-hub-image-input',
  coords: 'tenant-coords-input',
  colorPrimary: 'color-primary-input',
  uchColorPrimary: 'uch-color-primary-input',
  newsUrl: 'news-url',
};

type SettingBlockProps = SettingBlockTextProps & {
  children: React.ReactNode;
};

const SettingBlock = ({
  heading,
  description,
  children,
}: SettingBlockProps) => (
  <div className='xl:w-5/6 grid gap-x-16 gap-y-4 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]'>
    <SettingBlockTextColumn heading={heading} description={description} />
    <div>{children}</div>
  </div>
);

type SettingBlockTextProps = {
  heading: string;
  description: string;
};

const SettingBlockTextColumn = ({
  heading,
  description,
}: SettingBlockTextProps) => (
  <div className='flex flex-col gap-2'>
    <h3 className='leading-none text-xl font-bold text-gray-900'>{heading}</h3>
    <p className='text-gray-300 whitespace-pre-line'>{description}</p>
  </div>
);

const BlockSpacer = () => <hr className='h-px border-0 bg-gray-100' />;

/* v8 ignore start */
const TenantSettingsContent = ({
  tenantSettings,
  disabled = false,
}: {
  tenantSettings: TenantSettings;
  disabled?: boolean;
}) => {
  const tenantData = tenantSettings.data?.tenant;
  const initialState: TenantSettingsState = {
    data: {
      tenantDisplayName: tenantData?.tenantDisplayName ?? undefined,
      legalNoticeUrl: tenantData?.legalNoticeUrl ?? undefined,
      privacyUrl: tenantData?.privacyUrl ?? undefined,
      contactUrl: tenantData?.contactUrl ?? undefined,
      tenantLogoUrl: tenantData?.tenantLogoUrl ?? undefined,
      tenantImageUrl: tenantData?.tenantImageUrl ?? undefined,
      citizenHubImageUrl: tenantData?.citizenHubImageUrl ?? undefined,
      tenantCoords: tenantData?.tenantCoords ?? undefined,
      colorPrimary: tenantData?.colorPrimary ?? undefined,
      uchColorPrimary: tenantData?.uchColorPrimary ?? undefined,
      newsUrl: tenantData?.newsUrl ?? undefined,
    },
  };

  const [state, formAction, isLoading] = useActionState(
    updateTenantSettings,
    initialState,
  );

  useEffect(() => {
    const TOAST_MSG = {
      success: 'Einstellungen erfolgreich gespeichert',
      error: 'Einstellungen konnten nicht gespeichert werden',
    } as const;

    const isInitialState =
      JSON.stringify(state.data) === JSON.stringify(initialState.data) &&
      !state.errors;

    if (!isInitialState) {
      if (state.data && !state.errors) {
        UdpToast(TOAST_MSG.success, 'success')();
      }
      if (state.errors) {
        UdpToast(TOAST_MSG.error, 'error')();
      }
    }
  }, [initialState.data, state]);

  return (
    <Form action={formAction}>
      <FormContent state={state} disabled={disabled} isLoading={isLoading} />
    </Form>
  );
};
/* v8 ignore end */

const FormContent = ({
  state,
  disabled = false,
  isLoading,
}: {
  state: TenantSettingsState;
  disabled?: boolean;
  isLoading?: boolean;
}) => {
  const coords = state.data?.tenantCoords
    ? parseCoords(state.data?.tenantCoords)
    : null;

  return (
    <div className='flex flex-col gap-8'>
      <h2 className='text-2xl font-bold text-gray-900'>
        Mandanteneinstellungen
      </h2>

      <SettingBlock
        heading='Name des Mandanten'
        description='Geben Sie hier den Namen Ihres Mandanten ein (z.B. “Gütersloh”).'
      >
        <UdpTextInput
          name={FORM_NAMES.tenantName}
          placeholder='Name Ihres Mandanten hier eingeben'
          key={state.data?.tenantDisplayName}
          defaultValue={state.data?.tenantDisplayName}
          data-testid={TenantSettingsTestIds.name}
          errors={state.errors?.tenantDisplayName}
          required
          disabled={disabled}
        />
      </SettingBlock>
      <BlockSpacer />

      <SettingBlock
        heading='Logo'
        description={`Wählen Sie hier das Logo Ihres Mandanten aus.
        Das Logo sollte mindestens 500px breit sein.`}
      >
        <UdpImageInput
          name={FORM_NAMES.tenantLogoUrl}
          key={state.data?.tenantLogoUrl}
          currentImageUrl={state.data?.tenantLogoUrl}
          placeholder='Link zum Logo hier einfügen'
          imageHeading='Vorschau:'
          imageAlt='Kein Logo vorhanden'
          removeButtonText='Logo entfernen'
          errors={state.errors?.tenantLogoUrl}
          data-testid={TenantSettingsTestIds.logo}
          disabled={disabled}
        />
      </SettingBlock>
      <BlockSpacer />

      <SettingBlock
        heading='Titelbild GovHub'
        description={`Wählen Sie hier das Titelbild für die Startseite des GovHubs aus.
        Das Bild sollte mindestens 600px breit sein.`}
      >
        <UdpImageInput
          name={FORM_NAMES.tenantImageUrl}
          key={state.data?.tenantImageUrl}
          currentImageUrl={state.data?.tenantImageUrl}
          placeholder='Link zum Titelbild hier einfügen'
          imageHeading='Vorschau:'
          imageAlt='Kein Titelbild vorhanden'
          removeButtonText='Titelbild entfernen'
          errors={state.errors?.tenantImageUrl}
          data-testid={TenantSettingsTestIds.image}
          disabled={disabled}
        />
      </SettingBlock>
      <BlockSpacer />

      <SettingBlock
        heading='Titelbild Citizen Hub'
        description={`Wählen Sie hier das Titelbild für die Startseite des Citizen Hubs aus.`}
      >
        <UdpImageInput
          name={FORM_NAMES.citizenHubImageUrl}
          key={state.data?.citizenHubImageUrl}
          currentImageUrl={state.data?.citizenHubImageUrl}
          placeholder='Link zum Titelbild hier einfügen'
          imageHeading='Vorschau:'
          imageAlt='Kein Titelbild vorhanden'
          removeButtonText='Titelbild entfernen'
          errors={state.errors?.citizenHubImageUrl}
          data-testid={TenantSettingsTestIds.citizenHubImage}
          disabled={disabled}
        />
      </SettingBlock>
      <BlockSpacer />

      <SettingBlock
        heading='Farbe GovHub'
        description='Wählen Sie hier die Primärfarbe Ihres Mandanten für den GovHub aus.'
      >
        <UdpColorPicker
          name={FORM_NAMES.colorPrimary}
          key={state.data?.colorPrimary}
          hex={state.data?.colorPrimary}
          disabled={disabled}
        />
      </SettingBlock>
      <BlockSpacer />

      <SettingBlock
        heading='Farbe Citizen Hub'
        description='Wählen Sie hier die Primärfarbe Ihres Mandanten für den Citizen Hub aus.'
      >
        <UdpColorPicker
          name={FORM_NAMES.uchColorPrimary}
          key={state.data?.uchColorPrimary}
          hex={state.data?.uchColorPrimary}
          disabled={disabled}
        />
      </SettingBlock>
      <BlockSpacer />

      <SettingBlock
        heading='Neuigkeiten RSS Feed'
        description={
          'Geben Sie hier die URL Ihres RSS Feeds für die Neuigkeiten auf der Startseite ein.'
        }
      >
        <UdpTextInput
          name={FORM_NAMES.newsUrl}
          placeholder='Link zum RSS Feed hier eingeben'
          key={state.data?.newsUrl}
          defaultValue={state.data?.newsUrl}
          errors={state.errors?.newsUrl}
          data-testid={TenantSettingsTestIds.newsUrl}
          disabled={disabled}
        />
      </SettingBlock>
      <BlockSpacer />

      <SettingBlock
        heading='Koordinaten Rathaus'
        description={`Geben Sie hier die Koordinaten des Rathauses Ihres Mandanten ein.\
        Der Kartenausschnitt wird auf der Startseite angezeigt.
        Die Koordinaten sind zwei Zahlen mit Nachkommastellen, getrennt durch einen Doppelpunkt \
        (z.B. 10.2:30.4)`}
      >
        <UdpTextInput
          name={FORM_NAMES.tenantCoords}
          placeholder='Koordinaten hier eingeben'
          key={coords ? `${coords.x}:${coords.y}` : Date.now()}
          defaultValue={coords ? `${coords.x}:${coords.y}` : undefined}
          errors={state.errors?.tenantCoords}
          data-testid={TenantSettingsTestIds.coords}
          disabled={disabled}
        />
      </SettingBlock>
      <BlockSpacer />

      <SettingBlock
        heading={'Link zum Impressum'}
        description={'Geben Sie hier den Link zu Ihrem Impressum ein.'}
      >
        <UdpTextInput
          name={FORM_NAMES.legalNoticeUrl}
          placeholder={'Link zum Impressum hier eingeben'}
          key={state.data?.legalNoticeUrl}
          defaultValue={state.data?.legalNoticeUrl}
          errors={state.errors?.legalNoticeUrl}
          data-testid={TenantSettingsTestIds.legalNoticeUrl}
          required
          disabled={disabled}
        />
      </SettingBlock>
      <BlockSpacer />

      <SettingBlock
        heading={'Link zur Datenschutzerklärung'}
        description={
          'Geben Sie hier den Link zu Ihrer Datenschutzerklärung ein.'
        }
      >
        <UdpTextInput
          name={FORM_NAMES.privacyUrl}
          placeholder={'Link zur Datenschutzerklärung hier eingeben'}
          key={state.data?.privacyUrl}
          defaultValue={state.data?.privacyUrl}
          errors={state.errors?.privacyUrl}
          data-testid={TenantSettingsTestIds.privacyUrl}
          required
          disabled={disabled}
        />
      </SettingBlock>
      <BlockSpacer />

      <SettingBlock
        heading={'Link zu Kontaktdaten'}
        description={'Geben Sie hier den Link zu Ihren Kontaktdaten ein.'}
      >
        <UdpTextInput
          name={FORM_NAMES.contactUrl}
          placeholder={'Link zu Kontaktdaten hier eingeben'}
          key={state.data?.contactUrl}
          defaultValue={state.data?.contactUrl}
          errors={state.errors?.contactUrl}
          data-testid={TenantSettingsTestIds.contactUrl}
          required
          disabled={disabled}
        />
      </SettingBlock>
      <BlockSpacer />

      <ButtonBar disabled={disabled} isLoading={isLoading} />
    </div>
  );
};

const ButtonBar = ({
  disabled = false,
  isLoading,
}: {
  disabled?: boolean;
  isLoading?: boolean;
}) => (
  <div className='flex gap-2.5'>
    <UdpButton
      icon={IcSave}
      type='submit'
      disabled={disabled}
      loading={isLoading}
    >
      Speichern
    </UdpButton>
    <UdpButton color='tertiary' type='reset'>
      Abbrechen
    </UdpButton>
  </div>
);

export default TenantSettingsContent;
export const _internal = {
  FormContent,
};
