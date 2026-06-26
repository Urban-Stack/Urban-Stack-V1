import { useNextSWR } from '@/app/_lib/client/useNextSWR';
import {
  ContainerInfoResponseBody,
  ContainerInfoSuccessResponseBody,
} from '@/app/api/_common/containerinfo';
import { UseContainerInfoHook } from '@/app/_lib/resource-api/common/containerinfo';

export const useContainerInfo: UseContainerInfoHook = (
  tenant: string,
  name: string,
  lines = 1000,
) => {
  const url = `/api/dedicatedapp/containerinfo?tenant=${encodeURIComponent(tenant)}&name=${encodeURIComponent(name)}&lines=${lines}`;

  const fetcher = async (
    u: string,
  ): Promise<ContainerInfoSuccessResponseBody> => {
    const res = await fetch(u, { cache: 'no-store' });
    const json = (await res.json()) as ContainerInfoResponseBody;
    if ('error' in json) throw new Error(json.error);
    return json;
  };

  return useNextSWR<ContainerInfoSuccessResponseBody, Error>(url, fetcher, {
    refreshInterval: 5000,
  });
};
