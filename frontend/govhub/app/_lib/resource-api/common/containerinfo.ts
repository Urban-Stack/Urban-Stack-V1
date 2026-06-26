import { ContainerStatus } from '@/app/__generated__/types';
import { GetSharedAppContainerInfos } from '@/app/_lib/resource-api/graphql/sharedApps';
import { GetDedicatedAppContainerInfos } from '@/app/_lib/resource-api/graphql/dedicatedApps';

export type ContainerAppStatus = 'running' | 'waiting' | 'unknown';

export type ContainerInfo = {
  readonly name: string;
  readonly status: ContainerAppStatus;
  readonly ready: boolean;
  readonly logs: string;
  readonly restartCount?: number;
  readonly waitingReason?: string;
  readonly waitingMessage?: string;
};

export const mkContainerInfo = (
  name: string,
  status: ContainerAppStatus,
  ready: boolean,
  logs: string,
  restartCount?: number,
  waitingReason?: string,
  waitingMessage?: string,
): ContainerInfo => ({
  name,
  status,
  ready,
  logs,
  restartCount,
  waitingReason,
  waitingMessage,
});

export const getContainerStatus = (
  status?: ContainerStatus | null,
): ContainerAppStatus => {
  if (status?.running) return 'running';
  if (status?.waiting) return 'waiting';
  return 'unknown';
};

const normalizeLogs = (input: string): string => {
  if (input.includes('\\n') || input.includes('\\"')) {
    input = input.replaceAll('\\n', '\n').replaceAll('\\"', '"');
  }
  return input.replace(/\r\n?/g, '\n');
};

export type ContainerInfoQueryResult =
  | GetSharedAppContainerInfos
  | GetDedicatedAppContainerInfos;

export type UseContainerInfoHook = (
  tenant: string,
  name: string,
  lines?: number,
) => {
  data?: { containerInfo: ContainerInfo; updatedAt: string };
  isLoading: boolean;
  error?: Error;
};

export const toContainerInfo = (
  result: ContainerInfoQueryResult,
): ContainerInfo | undefined => {
  if (!result.data) return undefined;

  const appInfo = (() => {
    if ('sharedApp' in result.data && result.data.sharedApp)
      return {
        app: result.data.sharedApp,
        name: result.data.sharedApp?.sharedApp,
      };
    if ('dedicatedApp' in result.data && result.data.dedicatedApp)
      return {
        app: result.data.dedicatedApp,
        name: result.data.dedicatedApp?.dedicatedApp,
      };
    else return undefined;
  })();
  if (!appInfo) return undefined;

  const { app, name } = appInfo;
  return mkContainerInfo(
    name,
    getContainerStatus(app.containerStatus),
    !!app.containerStatus?.ready,
    normalizeLogs(app.containerLogs ?? ''),
    app.containerStatus?.restartCount ?? undefined,
    app.containerStatus?.waitingReason ?? undefined,
    app.containerStatus?.waitingMessage ?? undefined,
  );
};
