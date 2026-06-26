import { CitytoolCategory } from '@/app/__generated__/types';
import { CITYTOOL_CATEGORY_ORDER } from '@/app/citytools/_internal/categories';

export const sanitizeValue = (value: FormDataEntryValue | null) =>
  typeof value !== 'string' || value === '' ? undefined : value;

export const sanitizeCategories = (values: FormDataEntryValue[]) =>
  values
    .filter((val): val is string => typeof val === 'string')
    .filter((val): val is CitytoolCategory =>
      CITYTOOL_CATEGORY_ORDER.includes(val as CitytoolCategory),
    );
