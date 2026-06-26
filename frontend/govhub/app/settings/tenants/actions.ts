'use server';

import {
  FORM_NAMES,
  mkState,
  TenantSettingsState,
  UpdateTenantSettingsForm,
} from '@/app/settings/tenants/form';
import { mutateTenantSettings } from '@/app/_lib/resource-api/graphql/attributes';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { invertBy } from 'lodash';
import { Dictionary } from 'ts-essentials';

import { sanitizeValue } from '@/app/_lib/form/sanitize';

const keys: Readonly<Dictionary<string>> = {
  ...Object.fromEntries(
    Object.entries(invertBy(FORM_NAMES)).map(([k, v]) => [k, v[0]]),
  ),
  [FORM_NAMES.tenantName]: 'tenantDisplayName',
};

export const updateTenantSettings = async (
  _: TenantSettingsState,
  formData: FormData,
): Promise<TenantSettingsState> => {
  const sanitizedInputs = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [
      keys[key],
      sanitizeValue(value),
    ]),
  );

  const parsed = UpdateTenantSettingsForm.safeParse(sanitizedInputs);

  if (parsed.success) {
    return mkState(
      await mutateTenantSettings(
        await requireTenant(),
        parsed.data.tenantDisplayName,
        parsed.data.legalNoticeUrl,
        parsed.data.privacyUrl,
        parsed.data.contactUrl,
        parsed.data.tenantLogoUrl,
        parsed.data.tenantImageUrl,
        parsed.data.citizenHubImageUrl,
        parsed.data.tenantCoords,
        parsed.data.colorPrimary,
        parsed.data.uchColorPrimary,
        parsed.data.newsUrl,
      ),
    );
  }

  return {
    data: sanitizedInputs,
    errors: parsed.error.flatten().fieldErrors,
  };
};
