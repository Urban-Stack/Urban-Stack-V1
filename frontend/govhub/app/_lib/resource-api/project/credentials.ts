import 'server-only';
import { AllCredentials } from '@/app/_lib/resource-api/graphql/credentials';

export type SensorCredential = {
  readonly name: string;
  readonly username: string;
  readonly _tag: 'SensorCredential';
};

export const toSensorCredential: (
  result: AllCredentials,
) => SensorCredential[] = (result) =>
  result.data?.project?.sensorCredentials.map((c) =>
    mkSensorCredential(c.sensorCredential, c.username),
  ) ?? [];

const mkSensorCredential: (
  name: string,
  username: string,
) => SensorCredential = (name, username) => ({
  name,
  username,
  _tag: 'SensorCredential',
});

export const internal = {
  mkSensorCredential,
};
