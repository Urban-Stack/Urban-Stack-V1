import {
  AppTheme,
  AppThemeRaw,
  DEFAULT_THEME,
  unsafeMkTheme,
} from 'udp-ui/theme';
import {
  PublicAttributes,
  publicAttributes,
} from '@/app/_lib/resource-api/attributes/publicAttributes';
import { unsafeGetDefined } from 'udp-ui/assertion';

export const themeOrDefault: (tenant: string) => Promise<AppTheme> = async (
  tenant,
) => {
  try {
    return await publicAttributes(tenant)
      .then(unsafeThemeRaw)
      .then(unsafeMkTheme);
  } catch (_) {
    return DEFAULT_THEME;
  }
};

const unsafeThemeRaw: (result: PublicAttributes) => AppThemeRaw = (result) => ({
  colorPrimary: unsafeGetDefined(result.colorPrimary),
});
