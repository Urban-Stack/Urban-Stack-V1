import { identity } from 'lodash';
import {
  PublicSharedApp,
  SharedApp,
} from '@/app/_lib/resource-api/sharedapps/internal';
import { CitytoolCategory } from '@/app/__generated__/types';
import {
  fromAll as fromAllStaticApps,
  fromInstalled as fromInstalledStaticApps,
  fromNotInstalled as fromNotInstalledStaticApps,
  type StaticApp,
  type StaticApps,
} from '@/app/_lib/resource-api/staticapps';
import {
  type DedicatedApp,
  type DedicatedApps,
  fromAll as fromAllDedicatedApps,
  fromInstalled as fromInstalledDedicatedApps,
  fromNotInstalled as fromNotInstalledDedicatedApps,
} from '@/app/_lib/resource-api/dedicatedapps';
import { unsafeGetDefined } from 'udp-ui/assertion';

export type InstalledStatus = 'all' | 'installed' | 'not-installed';

export type CityTool = StaticApp | SharedApp | PublicSharedApp | DedicatedApp;

export const filterCityTools: (
  staticApps: StaticApps,
  sharedApps: SharedApp[],
  publicSharedApps: PublicSharedApp[],
  dedicatedApps: DedicatedApps,
  filter: {
    searchText?: string;
    installed?: InstalledStatus;
    categories?: CitytoolCategory[];
    myCity?: boolean;
    tenant?: string;
  },
) => CityTool[] = (
  staticApps,
  sharedApps,
  publicSharedApps,
  dedicatedApps,
  { searchText, installed = 'all', categories, myCity, tenant },
) => {
  const bySearchText = searchText
    ? (() => {
        const searchTextLowerCase = searchText.toLowerCase();
        return (ct: CityTool) =>
          ct.name.toLowerCase().includes(searchTextLowerCase) ||
          getDisplayName(ct).toLowerCase().includes(searchTextLowerCase) ||
          getDescription(ct).toLowerCase().includes(searchTextLowerCase);
      })()
    : identity;

  const byCategories =
    categories && categories.length > 0
      ? (ct: CityTool) => {
          switch (ct._tag) {
            case 'StaticApp':
            case 'DedicatedApp':
              return ct.meta.categories.some((c) => categories.includes(c));
            case 'SharedApp':
            case 'PublicSharedApp':
              return ct.categories.some((c) => categories.includes(c));
          }
        }
      : identity;

  const byMyCity =
    myCity && tenant
      ? (ct: CityTool) => {
          switch (ct._tag) {
            case 'PublicSharedApp':
              return ct.tenant === tenant;
            case 'SharedApp':
            case 'StaticApp':
            case 'DedicatedApp':
              return true;
          }
        }
      : identity;

  const shared: (SharedApp | PublicSharedApp)[] = [
    ...sharedApps,
    ...publicSharedApps.filter(
      (psa) => !sharedApps.some((sa) => sa.name === psa.name),
    ),
  ];

  const preFiltered: CityTool[] = (() => {
    switch (installed) {
      case 'installed':
        return [...fromInstalled(staticApps, dedicatedApps), ...sharedApps];
      case 'not-installed':
        return fromNotInstalled(staticApps, dedicatedApps);
      case 'all':
        return [...fromAll(staticApps, dedicatedApps), ...shared];
    }
  })();

  return preFiltered.filter(bySearchText).filter(byCategories).filter(byMyCity);
};

export const cmpDisplayName = (a: CityTool, b: CityTool) =>
  getDisplayName(a).localeCompare(getDisplayName(b));

export const getDisplayName = (ct: CityTool) => {
  switch (ct._tag) {
    case 'StaticApp':
    case 'DedicatedApp':
      return ct.meta.displayName;
    case 'SharedApp':
    case 'PublicSharedApp':
      return ct.displayName;
  }
};

export const getDescription = (ct: CityTool) => {
  switch (ct._tag) {
    case 'StaticApp':
    case 'DedicatedApp':
      return ct.meta.description;
    case 'SharedApp':
    case 'PublicSharedApp':
      return ct.description;
  }
};

export const getHref: (
  staticAppUrl: string,
  tenant: string,
) => (ct: CityTool) => string | undefined = (saUrl, tenant) => (ct) => {
  switch (ct._tag) {
    case 'StaticApp':
      return ct.finalPath ? `${saUrl}/${ct.finalPath}` : undefined;
    case 'DedicatedApp':
      return ct.url;
    case 'SharedApp':
      return `/citytools/shared-app/${tenant}/${ct.name}`;
    case 'PublicSharedApp':
      return ct.url;
  }
};

const fromInstalled: (
  staticApps: StaticApps,
  dedicatedApps: DedicatedApps,
) => CityTool[] = (staticApps, dedicatedApps) => [
  ...fromInstalledStaticApps(staticApps),
  ...fromInstalledDedicatedApps(dedicatedApps),
];

const fromNotInstalled: (
  staticApps: StaticApps,
  dedicatedApps: DedicatedApps,
) => CityTool[] = (staticApps, dedicatedApps) => [
  ...fromNotInstalledStaticApps(staticApps),
  ...fromNotInstalledDedicatedApps(dedicatedApps),
];

const fromAll: (
  staticApps: StaticApps,
  dedicatedApps: DedicatedApps,
) => CityTool[] = (staticApps, dedicatedApps) => [
  ...fromAllStaticApps(staticApps),
  ...fromAllDedicatedApps(dedicatedApps),
];

export interface CitytoolLink {
  displayName: string;
  href: string;
}

export const toCitytoolLink: (
  staticAppUrl: string,
) => (citytool: CityTool) => CitytoolLink = (saUrl) => (ct) => {
  switch (ct._tag) {
    case 'StaticApp':
      return {
        displayName: ct.meta.displayName,
        href: `${saUrl}/${unsafeGetDefined(ct.finalPath)}`,
      };
    case 'DedicatedApp':
      return {
        displayName: ct.meta.displayName,
        href: unsafeGetDefined(ct.url),
      };
    case 'SharedApp':
    case 'PublicSharedApp':
      return { displayName: ct.displayName, href: ct.url };
  }
};
