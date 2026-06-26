import { ZodError } from 'zod';
import {
  CreateSubscriptionForm,
  mkGetState,
  mkState,
  NEW_STRING,
} from './form';
import {
  CreateSubscription,
  SingleSubscription,
} from '@/app/_lib/resource-api/graphql/subscriptions';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('CreateSubscriptionForm Schema', () => {
  const validData = {
    name: 'valid-name',
    uri: 'https://example.com',
    topic: 'sensor/topic',
    format: 'zenner',
    username: 'user123',
    password: 'securepassword',
  };

  it('should pass with valid data', () => {
    expect(() => CreateSubscriptionForm.parse(validData)).not.toThrow();
  });

  describe('name field', () => {
    it('should fail if name is too short', () => {
      expect(() =>
        CreateSubscriptionForm.parse({ ...validData, name: 'ab' }),
      ).toThrow('Subscription-Name muss mindestens 3 Zeichen beinhalten');
    });

    it('should fail if name is too long', () => {
      expect(() =>
        CreateSubscriptionForm.parse({ ...validData, name: 'a'.repeat(65) }),
      ).toThrow('Subscription-Name darf maximal 64 Zeichen beinhalten');
    });

    it(`should fail if name is exactly "${NEW_STRING}"`, () => {
      expect(() =>
        CreateSubscriptionForm.parse({ ...validData, name: NEW_STRING }),
      ).toThrow(ZodError);
    });

    it('should fail if name contains uppercase letters', () => {
      expect(() =>
        CreateSubscriptionForm.parse({ ...validData, name: 'Invalid-Name' }),
      ).toThrow(
        'Subscription-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
      );
    });

    it('should fail if name contains special characters', () => {
      expect(() =>
        CreateSubscriptionForm.parse({ ...validData, name: 'invalid$name' }),
      ).toThrow(
        'Subscription-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
      );
    });
  });

  describe('uri field', () => {
    it('should fail if URI is not a valid URL', () => {
      expect(() =>
        CreateSubscriptionForm.parse({ ...validData, uri: 'invalid-uri' }),
      ).toThrow('URI nicht valide');
    });
  });

  describe('topic field', () => {
    it('should fail if topic is too short', () => {
      expect(() =>
        CreateSubscriptionForm.parse({ ...validData, topic: 'ab' }),
      ).toThrow('Subscription-Topic muss mindestens 3 Zeichen beinhalten');
    });

    it('should fail if topic is too long', () => {
      expect(() =>
        CreateSubscriptionForm.parse({ ...validData, topic: 'a'.repeat(65) }),
      ).toThrow('Subscription-Topic darf maximal 64 Zeichen beinhalten');
    });
  });

  describe('username field', () => {
    it('should fail if username is too short', () => {
      expect(() =>
        CreateSubscriptionForm.parse({ ...validData, username: 'ab' }),
      ).toThrow('Subscription-Username muss mindestens 3 Zeichen beinhalten');
    });

    it('should fail if username is too long', () => {
      expect(() =>
        CreateSubscriptionForm.parse({
          ...validData,
          username: 'a'.repeat(65),
        }),
      ).toThrow('Subscription-Username darf maximal 64 Zeichen beinhalten');
    });
  });

  describe('password field', () => {
    it('should fail if password is too long', () => {
      expect(() =>
        CreateSubscriptionForm.parse({
          ...validData,
          password: 'a'.repeat(256),
        }),
      ).toThrow('Subscription-Password darf maximal 255 Zeichen beinhalten');
    });
  });
});

describe('mkState', () => {
  it('returns errors with mapped error messages', () => {
    const result: CreateSubscription = {
      error: mkCombinedGraphQLError('Error 1', 'Error 2'),
      data: undefined,
    };

    const state = mkState(result);

    expect(state.errors?.general).toEqual(['Error 1', 'Error 2']);
  });

  it('throws if format in result is invalid', () => {
    const result: CreateSubscription = {
      error: undefined,
      data: {
        tenant: {
          project: {
            createSensorSubscription: {
              sensorSubscription: 'subscription1',
              config: {
                uri: 'https://example.com',
                topic: 'sensor/topic',
                format: 'invalid-format',
                username: 'sensoruser',
              },
            },
          },
        },
      },
    };

    expect(() => mkState(result)).toThrow(ZodError);
  });

  it('returns correct data on success', () => {
    const subscriptionName = 'subscription1';
    const subscriptionConfig = {
      uri: 'https://example.com',
      topic: 'sensor/topic',
      format: 'zenner',
      username: 'sensoruser',
    };

    const result: CreateSubscription = {
      error: undefined,
      data: {
        tenant: {
          project: {
            createSensorSubscription: {
              sensorSubscription: subscriptionName,
              config: subscriptionConfig,
            },
          },
        },
      },
    };

    const state = mkState(result);

    expect(state.data?.name).toEqual('subscription1');
    expect(state.data?.config).toMatchObject({
      uri: subscriptionConfig.uri,
      topic: subscriptionConfig.topic,
      username: subscriptionConfig.username,
      format: subscriptionConfig.format,
    });
  });
});

describe('mkGetState', () => {
  describe('error handling', () => {
    it('returns errors with mapped error messages', () => {
      const result = {
        error: mkCombinedGraphQLError('Error 1', 'Error 2'),
        data: undefined,
      } as unknown as SingleSubscription;

      const state = mkGetState(result);

      expect(state.errors?.general).toEqual(['Error 1', 'Error 2']);
    });
  });

  describe('data transformation', () => {
    it('throws if format in result is invalid', () => {
      const result = {
        error: undefined,
        data: {
          sensorSubscription: {
            config: {
              uri: 'https://example.com',
              topic: 'sensor/topic',
              format: 'invalid-format',
              username: 'sensoruser',
            },
          },
        },
      } as SingleSubscription;

      expect(() => mkGetState(result)).toThrow(ZodError);
    });

    it('returns correct data on success', () => {
      const subscriptionConfig = {
        uri: 'https://example.com',
        topic: 'sensor/topic',
        format: 'zenner',
        username: 'sensoruser',
      };

      const result = {
        error: undefined,
        data: {
          sensorSubscription: {
            config: subscriptionConfig,
          },
        },
      } as SingleSubscription;

      const state = mkGetState(result);

      expect(state.data?.config).toMatchObject({
        uri: subscriptionConfig.uri,
        topic: subscriptionConfig.topic,
        username: subscriptionConfig.username,
        format: subscriptionConfig.format,
      });
    });
  });
});
