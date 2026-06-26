import { QueriedPublicStaticApps } from '@/app/_lib/resource-api/graphql/staticApps';
import { CitytoolCategory } from '@/app/__generated__/types';

export type StaticApp = {
  readonly displayName: string;
  readonly finalPath: string;
  readonly description: string;
  readonly categories: CitytoolCategory[];
  readonly pictureUri?: string;
  readonly _tag: 'StaticApp';
};

export const toStaticApps: (
  result: QueriedPublicStaticApps,
  tenant: string,
) => StaticApp[] = (result, tenant) =>
  (result.data?.publicCitytools ?? []).map((ct) =>
    mkStaticApp(
      ct.displayName,
      ct.path && `${tenant}/${ct.path}${ct.indexPath ?? ''}`,
      ct.description,
      ct.categories,
      ct.pictureUri ?? undefined,
    ),
  );

const mkStaticApp: (
  displayName: string,
  finalPath: string,
  description: string,
  categories: CitytoolCategory[],
  pictureUri?: string,
) => StaticApp = (
  displayName,
  finalPath,
  description,
  categories,
  pictureUri,
): StaticApp => ({
  displayName,
  finalPath,
  description,
  categories,
  pictureUri,
  _tag: 'StaticApp',
});

export const internal = {
  mkStaticApp,
};
