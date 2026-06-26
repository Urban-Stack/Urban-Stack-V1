import { AllAndInstalledDedicatedApps } from '@/app/_lib/resource-api/graphql/dedicatedApps';
import { CitytoolCategory } from '@/app/__generated__/types';
import { assertDefined } from 'udp-ui/assertion';

export type DedicatedApps = {
  readonly all: ReadonlyMap<string, DedicatedAppInfo>;
  readonly installed: ReadonlyMap<string, DedicatedAppInstall>;
  readonly tenant: string;
  readonly _tag: 'DedicatedApps';
};

export type DedicatedAppInfo = {
  readonly name: string;
  readonly meta: {
    readonly displayName: string;
    readonly description: string;
    readonly categories: CitytoolCategory[];
    readonly pictureUri?: string;
    readonly indexPath?: string;
  };
  readonly requestCityToolLink: string;
  readonly _tag: 'DedicatedAppInfo';
};

export type DedicatedAppInstall = {
  readonly name: string;
  readonly url: string;
  readonly _tag: 'DedicatedAppInstall';
};

export type DedicatedApp = {
  readonly url?: string;
  readonly isInstalled: boolean;
  readonly _tag: 'DedicatedApp';
} & Omit<DedicatedAppInfo, '_tag'>;

export const toDedicatedApps: (
  tenant: string,
) => (result: AllAndInstalledDedicatedApps) => DedicatedApps =
  (tenant) => (result) => {
    const all: ReadonlyMap<string, DedicatedAppInfo> = new Map(
      (result.data?.all ?? []).map((da) => [
        da.dedicatedApp,
        mkDedicatedAppInfo(da.dedicatedApp, da.requestCityToolLink, {
          displayName: da.info.name,
          description: da.info.description,
          categories: da.info.categories,
          pictureUri: da.info.pictureUri ?? undefined,
          indexPath: da.info.indexPath ?? undefined,
        }),
      ]),
    );
    const installed: ReadonlyMap<string, DedicatedAppInstall> = new Map(
      (result.data?.installed?.dedicatedApps ?? []).map((da) => [
        da.dedicatedApp,
        mkDedicatedAppInstall(da.dedicatedApp, da.url),
      ]),
    );
    return { all, installed, tenant, _tag: 'DedicatedApps' };
  };

export const fromInstalled: (dedicatedApps: DedicatedApps) => DedicatedApp[] = (
  dedicatedApps,
) =>
  Array.from(dedicatedApps.installed.entries()).map(([name, { url }]) => {
    const dedicatedAppInfo = dedicatedApps.all.get(name);
    assertDefined(
      dedicatedAppInfo,
      `${name} not found in all dedicated apps. Installed dedicated apps must be in all dedicated apps.`,
    );
    return mkDedicatedApp(dedicatedAppInfo, true, url);
  });

export const fromNotInstalled: (
  dedicatedApps: DedicatedApps,
) => DedicatedApp[] = (dedicatedApps) =>
  Array.from(dedicatedApps.all.entries())
    .filter(([name]) => !dedicatedApps.installed.has(name))
    .map(([_, info]) => mkDedicatedApp(info, false, undefined));

export const fromAll: (dedicatedApps: DedicatedApps) => DedicatedApp[] = (
  dedicatedApps,
) =>
  Array.from(dedicatedApps.all.entries()).map(([name, info]) => {
    const installed = dedicatedApps.installed.get(name);
    return mkDedicatedApp(info, installed !== undefined, installed?.url);
  });

export const mkDedicatedApp: (
  info: DedicatedAppInfo,
  isInstalled?: boolean,
  url?: string,
) => DedicatedApp = (info, isInstalled, url) => ({
  ...info,
  url,
  isInstalled: isInstalled ?? false,
  _tag: 'DedicatedApp',
});

export const isDedicatedApp = (app: unknown): app is DedicatedApp =>
  typeof app === 'object' &&
  app !== null &&
  (app as { _tag?: unknown })._tag === 'DedicatedApp';

export const mkDedicatedAppInfo: (
  name: string,
  requestCityToolLink: string,
  meta: {
    displayName: string;
    description: string;
    categories: CitytoolCategory[];
    pictureUri?: string;
    indexPath?: string;
  },
) => DedicatedAppInfo = (name, requestCityToolLink, meta) => ({
  name,
  requestCityToolLink,
  meta,
  _tag: 'DedicatedAppInfo',
});

export const mkDedicatedAppInstall: (
  name: string,
  url: string,
) => DedicatedAppInstall = (name, url) => ({
  name,
  url,
  _tag: 'DedicatedAppInstall',
});
