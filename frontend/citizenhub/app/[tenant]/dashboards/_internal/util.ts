import { identity } from 'lodash';
import { Dashboard } from '@/app/_lib/superset';

export const filterDashboards: (
  dashboards: Dashboard[],
  filter: {
    searchText?: string;
  },
) => Dashboard[] = (dashboards, { searchText }): Dashboard[] => {
  const bySearchText = searchText
    ? (() => {
        const searchTextLowerCase = searchText.toLowerCase();
        return (d: Dashboard) =>
          d.title?.toLowerCase().includes(searchTextLowerCase);
      })()
    : identity;

  return dashboards.filter(bySearchText);
};
