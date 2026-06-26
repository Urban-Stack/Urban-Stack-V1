import { StaticApp } from '@/app/_lib/citytools/internal';
import { identity } from 'lodash';

export const filterStaticApps: (
  staticApps: StaticApp[],
  filter: {
    searchText?: string;
  },
) => StaticApp[] = (staticApps, { searchText }) => {
  const bySearchText = searchText
    ? (() => {
        const searchTextLowerCase = searchText.toLowerCase();
        return (c: StaticApp) =>
          c.displayName.toLowerCase().includes(searchTextLowerCase) ||
          c.description.toLowerCase().includes(searchTextLowerCase);
      })()
    : identity;

  return staticApps.filter(bySearchText);
};
