import {
  GetPublicSharedApps,
  GetSharedApps,
} from '@/app/_lib/resource-api/graphql/sharedApps';
import { CitytoolCategory } from '@/app/__generated__/types';
import {
  ContainerAppStatus,
  getContainerStatus,
} from '@/app/_lib/resource-api/common/containerinfo';

export type SharedAppStatus = ContainerAppStatus;

export type SharedApp = {
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly pictureUri?: string;
  readonly categories: CitytoolCategory[];
  readonly adminContact: string;
  readonly url: string;
  readonly status: SharedAppStatus;
  readonly ready: boolean;
  readonly _tag: 'SharedApp';
};

export type PublicSharedApp = {
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly pictureUri?: string;
  readonly categories: CitytoolCategory[];
  readonly adminContact: string;
  readonly tenant: string;
  readonly tenantDisplayName?: string;
  readonly url: string;
  readonly _tag: 'PublicSharedApp';
};

export const toSharedApps: (result: GetSharedApps) => SharedApp[] = (result) =>
  result.data?.tenant?.sharedApps?.map((app) => ({
    name: app.sharedApp,
    displayName: app.config.displayName,
    description: app.config.description,
    pictureUri: app.config.pictureUri ?? undefined,
    categories: app.config.categories,
    adminContact: app.config.adminContact,
    url: app.url,
    status: getContainerStatus(app.containerStatus),
    ready: !!app.containerStatus?.ready,
    _tag: 'SharedApp',
  })) ?? [];

export const toPublicSharedApps: (
  result: GetPublicSharedApps,
) => PublicSharedApp[] = (result) =>
  result.data?.publicSharedApps?.map((app) => ({
    name: app.sharedApp,
    displayName: app.displayName,
    description: app.description,
    pictureUri: app.pictureUri ?? undefined,
    categories: app.categories,
    adminContact: app.adminContact,
    tenant: app.tenant,
    tenantDisplayName: app.tenantDisplayName ?? undefined,
    url: app.url,
    _tag: 'PublicSharedApp',
  })) ?? [];
