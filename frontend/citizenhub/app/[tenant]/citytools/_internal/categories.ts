import { CitytoolCategory } from '@/app/__generated__/types';

export const CITYTOOL_CATEGORY_LABELS = {
  [CitytoolCategory.AppsTools]: 'Apps & Tools',
  [CitytoolCategory.CitizenServices]: 'Bürgerservices',
  [CitytoolCategory.DataAnalytics]: 'Datenanalyse',
  [CitytoolCategory.GeoInformation]: 'Geoinformation',
  [CitytoolCategory.IntelligentAutomation]: 'Intelligente Automation',
  [CitytoolCategory.Office]: 'Office',
  [CitytoolCategory.SpecializedApplication]: 'Fachverfahren',
} satisfies Readonly<Record<CitytoolCategory, string>>;
