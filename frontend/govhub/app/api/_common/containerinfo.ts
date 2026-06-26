import { ContainerInfo } from '@/app/_lib/resource-api/common/containerinfo';

export type ContainerInfoSuccessResponseBody = {
  containerInfo: ContainerInfo;
  updatedAt: string;
  _tag: 'ContainerInfoSuccessResponseBody';
};
export type ContainerInfoErrorResponseBody = {
  error: string;
  _tag: 'ContainerInfoErrorResponseBody';
};

export type ContainerInfoResponseBody =
  | ContainerInfoSuccessResponseBody
  | ContainerInfoErrorResponseBody;

export const isSuccess: (
  resp: ContainerInfoResponseBody,
) => resp is ContainerInfoSuccessResponseBody = (resp) =>
  resp._tag === 'ContainerInfoSuccessResponseBody';

export const isError: (
  resp: ContainerInfoResponseBody,
) => resp is ContainerInfoErrorResponseBody = (resp) =>
  resp._tag === 'ContainerInfoErrorResponseBody';

export const mkSuccess: (
  info: ContainerInfo,
) => ContainerInfoSuccessResponseBody = (info) => ({
  containerInfo: info,
  updatedAt: new Date().toISOString(),
  _tag: 'ContainerInfoSuccessResponseBody',
});

export const mkError: (error: string) => ContainerInfoErrorResponseBody = (
  error,
) => ({
  error,
  _tag: 'ContainerInfoErrorResponseBody',
});
