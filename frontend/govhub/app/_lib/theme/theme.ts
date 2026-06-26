import 'server-only';
import {
  AppTheme,
  AppThemeRaw,
  DEFAULT_THEME,
  unsafeMkTheme,
} from 'udp-ui/theme';
import { unsafeGetDefined } from 'udp-ui/assertion';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import {
  fetchThemeAttributes,
  ThemeAttributes,
} from '@/app/_lib/resource-api/graphql/attributes';
import { asyncElse } from 'udp-ui/fp';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export const themeOrDefault: () => Promise<AppTheme> = async () =>
  asyncElse(DEFAULT_THEME)(unsafeTheme, isRedirectError);

const unsafeTheme: () => Promise<AppTheme> = async () => {
  const tenant = await requireTenant();
  return fetchThemeAttributes(tenant).then(unsafeThemeRaw).then(unsafeMkTheme);
};

const unsafeThemeRaw: (result: ThemeAttributes) => AppThemeRaw = (result) => {
  const colorPrimary = result.data?.tenant?.colorPrimary;
  return {
    colorPrimary: unsafeGetDefined(colorPrimary),
  };
};

export const internal = {
  unsafeTheme,
  unsafeThemeRaw,
};
