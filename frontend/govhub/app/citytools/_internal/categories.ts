import { CitytoolCategory } from '@/app/__generated__/types';

export type CategoryOption = {
  id: string;
  label: string;
  checked: boolean;
};

export const CITYTOOL_CATEGORY_LABELS = {
  [CitytoolCategory.AppsTools]: 'Apps & Tools',
  [CitytoolCategory.CitizenServices]: 'Bürgerservices',
  [CitytoolCategory.DataAnalytics]: 'Datenanalyse',
  [CitytoolCategory.GeoInformation]: 'Geoinformation',
  [CitytoolCategory.IntelligentAutomation]: 'Intelligente Automation',
  [CitytoolCategory.Office]: 'Office',
  [CitytoolCategory.SpecializedApplication]: 'Fachverfahren',
} satisfies Record<CitytoolCategory, string>;

export const CITYTOOL_CATEGORY_BY_LABEL: Record<string, CitytoolCategory> =
  Object.fromEntries(
    Object.entries(CITYTOOL_CATEGORY_LABELS).map(([key, value]) => [
      value,
      key,
    ]),
  ) as Record<string, CitytoolCategory>;

export const CITYTOOL_CATEGORY_ORDER: CitytoolCategory[] = [
  CitytoolCategory.AppsTools,
  CitytoolCategory.CitizenServices,
  CitytoolCategory.DataAnalytics,
  CitytoolCategory.SpecializedApplication,
  CitytoolCategory.GeoInformation,
  CitytoolCategory.IntelligentAutomation,
  CitytoolCategory.Office,
];

export const buildCategoryOptions = (
  selected?: string[] | null,
): CategoryOption[] => {
  const selectedSet = new Set(selected ?? []);
  return CITYTOOL_CATEGORY_ORDER.map((id) => ({
    id: CITYTOOL_CATEGORY_LABELS[id],
    label: CITYTOOL_CATEGORY_LABELS[id],
    checked: selectedSet.has(CITYTOOL_CATEGORY_LABELS[id]),
  }));
};
