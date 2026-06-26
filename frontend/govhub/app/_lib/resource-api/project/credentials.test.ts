import {
  internal,
  toSensorCredential,
} from '@/app/_lib/resource-api/project/credentials';
import { AllCredentials } from '@/app/_lib/resource-api/graphql/credentials';

describe('toSensorCredentials', () => {
  it('should return an array of SensorCredential objects', () => {
    const result = {
      data: {
        project: {
          sensorCredentials: [
            { sensorCredential: 'sensor1', username: 'user1' },
            { sensorCredential: 'sensor2', username: 'user2' },
          ],
        },
      },
    } as unknown as AllCredentials;

    const sensorCredentials = toSensorCredential(result);

    expect(sensorCredentials).toEqual([
      { name: 'sensor1', username: 'user1', _tag: 'SensorCredential' },
      { name: 'sensor2', username: 'user2', _tag: 'SensorCredential' },
    ]);
  });

  it('should return an empty array if no sensorCredentials exist', () => {
    const result = {
      data: {
        project: {
          sensorCredentials: [],
        },
      },
    } as unknown as AllCredentials;

    const sensorCredentials = toSensorCredential(result);

    expect(sensorCredentials).toEqual([]);
  });
});

describe('mkSensorCredential', () => {
  it('should return a SensorCredential object', () => {
    const sensorCredential = internal.mkSensorCredential('sensor1', 'user1');
    expect(sensorCredential).toEqual({
      name: 'sensor1',
      username: 'user1',
      _tag: 'SensorCredential',
    });
  });
});
