import { AllAndInstalledStaticApps } from '@/app/_lib/resource-api/graphql/staticapps';
import { CitytoolCategory } from '@/app/__generated__/types';
import { assertDefined } from 'udp-ui/assertion';

export type StaticApps = Readonly<{
  all: ReadonlyMap<string, StaticAppInfo>;
  installed: ReadonlyMap<string, StaticAppInstall>;
  readonly tenant?: string;
  _tag: 'StaticApps';
}>;

export type StaticApp = {
  readonly finalPath?: string;
  readonly isInstalled: boolean;
  readonly _tag: 'StaticApp';
} & Omit<StaticAppInfo, '_tag'>;

export type StaticAppInfo = {
  readonly name: string;
  readonly meta: {
    readonly displayName: string;
    readonly description: string;
    readonly pictureUri?: string;
    readonly categories: CitytoolCategory[];
    readonly showInCitizenHub: boolean;
    readonly showInGovHub: boolean;
    readonly indexPath?: string;
  };
  readonly overallInstalls: {
    readonly averageStars?: number;
    readonly count?: number;
  };
  readonly requestCityToolLink: string;
  readonly _tag: 'StaticAppInfo';
};

export type StaticAppInstall = {
  readonly name: string;
  readonly path: string;
  readonly _tag: 'StaticAppInstall';
};

export const toStaticApps: (result: AllAndInstalledStaticApps) => StaticApps = (
  result,
) => {
  const all: ReadonlyMap<string, StaticAppInfo> = new Map(
    (result.data?.allExisting ?? []).map((ct) => [
      ct.citytool,
      mkStaticAppInfo(
        ct.citytool,
        ct.requestCityToolLink,
        {
          displayName: ct.info.name,
          description: ct.info.description,
          pictureUri: ct.info.pictureUri ?? undefined,
          categories: ct.info.categories,
          showInCitizenHub: ct.info.showInCitizenhub,
          showInGovHub: ct.info.showInGovhub,
          indexPath: ct.info.indexPath ?? undefined,
        },
        {
          averageStars: ct.installs.averageStars ?? undefined,
          count: ct.installs.count,
        },
      ),
    ]),
  );
  const installed: ReadonlyMap<string, StaticAppInstall> = new Map(
    (result.data?.installed?.citytools ?? []).map((ct) => [
      ct.citytool,
      mkStaticAppInstall(ct.citytool, ct.path),
    ]),
  );
  const tenant = result.data?.installed?.tenant;
  return { all, installed, tenant, _tag: 'StaticApps' } as const;
};

export const mkStaticApp: (
  staticAppInfo: StaticAppInfo,
  isInstalled?: boolean,
  tenant?: string,
  path?: string,
) => StaticApp = (staticAppInfo, isInstalled, tenant, path) => ({
  ...staticAppInfo,
  isInstalled: isInstalled ?? false,
  finalPath:
    tenant && path && `${tenant}/${path}${staticAppInfo.meta.indexPath ?? ''}`,
  _tag: 'StaticApp',
});

export const isStaticApp = (app: unknown): app is StaticApp =>
  typeof app === 'object' &&
  app !== null &&
  (app as { _tag?: unknown })._tag === 'StaticApp';

export const fromInstalled = (staticApps: StaticApps) =>
  Array.from(staticApps.installed.entries()).map(([name, { path }]) => {
    const staticAppInfo = staticApps.all.get(name);
    assertDefined(
      staticAppInfo,
      `${name} not found in all city tools. Installed city tools must be in all city tools.`,
    );
    return mkStaticApp(staticAppInfo, true, staticApps.tenant, path);
  });

export const fromNotInstalled = (staticApps: StaticApps) =>
  Array.from(staticApps.all.entries())
    .filter(([name]) => !staticApps.installed.has(name))
    .map(([_, info]) => mkStaticApp(info, false, undefined));

export const fromAll: (staticApps: StaticApps) => StaticApp[] = (staticApps) =>
  Array.from(staticApps.all.entries()).map(([name, info]) => {
    const installed = staticApps.installed.get(name);
    return mkStaticApp(
      info,
      installed !== undefined,
      staticApps.tenant,
      installed?.path,
    );
  });

const mkStaticAppInfo: (
  name: string,
  requestCityToolLink: string,
  meta: {
    displayName: string;
    description: string;
    pictureUri?: string;
    categories: CitytoolCategory[];
    showInCitizenHub: boolean;
    showInGovHub: boolean;
    indexPath?: string;
  },
  overallInstalls?: {
    averageStars?: number;
    count?: number;
  },
) => StaticAppInfo = (name, requestCityToolLink, info, installs) => ({
  name,
  meta: {
    displayName: info.displayName,
    description: info.description,
    pictureUri: info.pictureUri,
    categories: info.categories,
    showInCitizenHub: info.showInCitizenHub,
    showInGovHub: info.showInGovHub,
    indexPath: info.indexPath,
  },
  overallInstalls: {
    averageStars: installs?.averageStars,
    count: installs?.count,
  },
  requestCityToolLink: requestCityToolLink,
  _tag: 'StaticAppInfo',
});

const mkStaticAppInstall: (name: string, path: string) => StaticAppInstall = (
  name,
  path,
) => ({
  name,
  path,
  _tag: 'StaticAppInstall',
});

export const internal = {
  mkStaticAppInfo,
  mkStaticAppInstall,
};
