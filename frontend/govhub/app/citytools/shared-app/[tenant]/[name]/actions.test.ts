import { revalidatePath } from 'next/cache';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import {
  mutateCreateSharedApp,
  mutateUpdateSharedApp,
  queryGetSharedApp,
} from '@/app/_lib/resource-api/graphql/sharedApps';
import { notFound } from 'next/navigation';
import { createSharedApp, getSharedApp, updateSharedApp } from './actions';
import { FORM_NAMES } from './form';
import { newName } from '@/app/_lib/resource-api/util/name';
import { CITYTOOL_CATEGORY_ORDER } from '@/app/citytools/_internal/categories';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

jest.mock('@/app/_lib/resource-api/graphql/sharedApps', () => ({
  mutateCreateSharedApp: jest.fn(),
  mutateUpdateSharedApp: jest.fn(),
  queryGetSharedApp: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

const digest = (algo: string, n: number) => `${algo}:${'a'.repeat(n)}`;

const TENANT = 'tenant-1';
const SOME_CATEGORIES = CITYTOOL_CATEGORY_ORDER.slice(1, 3);

beforeEach(() => {
  jest.clearAllMocks();
});

const mkFormData = (overrides?: Partial<Record<string, string | string[]>>) => {
  const form = new FormData();
  const values: Record<string, string | string[]> = {
    [FORM_NAMES.displayName]: 'My App 42',
    [FORM_NAMES.description]: 'desc',
    [FORM_NAMES.pictureUri]: 'https://picture/path.png',
    [FORM_NAMES.categories]: SOME_CATEGORIES,
    [FORM_NAMES.contact]: 'user@example.com',
    [FORM_NAMES.imageDigest]: digest('sha256', 64),
    [FORM_NAMES.imageRepository]: 'repo',
    [FORM_NAMES.imageRegistry]: 'registry.test',
    [FORM_NAMES.username]: '',
    [FORM_NAMES.password]: '',
    ...(overrides ?? {}),
  };
  Object.entries(values).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      v.forEach((item) => form.append(k, item));
    } else {
      form.append(k, v);
    }
  });
  return form;
};

describe('createSharedApp', () => {
  it('returns validation errors and preserves data when invalid', async () => {
    const form = mkFormData({ [FORM_NAMES.contact]: 'not-an-email-or-url' });

    const state = await createSharedApp(TENANT, {}, form);

    expect(mutateCreateSharedApp).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(state.errors?.contact).toHaveLength(1);
    expect(state.data).toEqual({
      displayName: 'My App 42',
      description: 'desc',
      pictureUri: 'https://picture/path.png',
      categories: SOME_CATEGORIES,
      contact: 'not-an-email-or-url',
      config: {
        imageDigest: digest('sha256', 64),
        imageRepository: 'repo',
        imageRegistry: 'registry.test',
        username: '',
      },
    });
  });

  it('creates shared app, revalidates, and returns state on success', async () => {
    const displayName = 'Great App!! 42';
    const expectedName = newName(displayName);
    (mutateCreateSharedApp as jest.Mock).mockResolvedValue({
      error: undefined,
      data: {
        tenant: {
          createSharedApp: {
            sharedApp: expectedName,
            config: {
              displayName,
              description: 'desc',
              pictureUri: 'https://picture/path.png',
              categories: SOME_CATEGORIES,
              adminContact: 'user@example.com',
              imageDigest: digest('sha256', 64),
              imageRepository: 'repo',
              imageRegistry: 'registry.test',
              registryUsername: 'user',
            },
          },
        },
      },
    });

    const form = mkFormData({
      [FORM_NAMES.displayName]: displayName,
      [FORM_NAMES.username]: 'user',
      [FORM_NAMES.password]: 'secret',
    });

    const state = await createSharedApp(TENANT, {}, form);

    expect(mutateCreateSharedApp).toHaveBeenCalledWith(TENANT, expectedName, {
      displayName,
      description: 'desc',
      pictureUri: 'https://picture/path.png',
      categories: SOME_CATEGORIES,
      adminContact: 'user@example.com',
      image: {
        digest: digest('sha256', 64),
        repository: 'repo',
        registry: 'registry.test',
        username: 'user',
        password: 'secret',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state.errors).toBeUndefined();
    expect(state.data).toEqual({
      displayName,
      description: 'desc',
      pictureUri: 'https://picture/path.png',
      categories: SOME_CATEGORIES,
      contact: 'user@example.com',
      config: {
        imageDigest: digest('sha256', 64),
        imageRepository: 'repo',
        imageRegistry: 'registry.test',
        username: 'user',
      },
    });
  });

  it('passes undefined credentials when username/password empty', async () => {
    (mutateCreateSharedApp as jest.Mock).mockResolvedValue({
      error: undefined,
      data: {
        tenant: {
          createSharedApp: {
            sharedApp: 'name-1',
            config: {
              displayName: 'My App 42',
              description: 'desc',
              categories: [],
              adminContact: 'user@example.com',
              imageDigest: digest('sha256', 64),
              imageRepository: 'repo',
              imageRegistry: 'registry.test',
              registryUsername: undefined,
            },
          },
        },
      },
    });

    const form = mkFormData({
      [FORM_NAMES.username]: '',
      [FORM_NAMES.password]: '',
    });

    await createSharedApp(TENANT, {}, form);

    expect(mutateCreateSharedApp).toHaveBeenCalledWith(
      TENANT,
      newName('My App 42'),
      expect.objectContaining({
        image: expect.objectContaining({
          username: undefined,
          password: undefined,
        }),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
  });

  it('passes empty uri when pictureUri is empty', async () => {
    (mutateCreateSharedApp as jest.Mock).mockResolvedValue({
      error: undefined,
      data: {
        tenant: {
          createSharedApp: {
            sharedApp: 'name-1',
            config: {
              displayName: 'My App 42',
              description: 'desc',
              categories: [],
              adminContact: 'user@example.com',
              imageDigest: digest('sha256', 64),
              imageRepository: 'repo',
              imageRegistry: 'registry.test',
              registryUsername: undefined,
            },
          },
        },
      },
    });

    const form = mkFormData({
      [FORM_NAMES.pictureUri]: '',
    });

    await createSharedApp(TENANT, {}, form);

    expect(mutateCreateSharedApp).toHaveBeenCalledWith(
      TENANT,
      newName('My App 42'),
      expect.objectContaining({
        pictureUri: '',
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
  });

  it('passes empty categories list when none were selected', async () => {
    (mutateCreateSharedApp as jest.Mock).mockResolvedValue({
      error: undefined,
      data: {
        tenant: {
          createSharedApp: {
            sharedApp: 'name-1',
            config: {
              displayName: 'My App 42',
              description: 'desc',
              categories: [],
              adminContact: 'user@example.com',
              imageDigest: digest('sha256', 64),
              imageRepository: 'repo',
              imageRegistry: 'registry.test',
              registryUsername: undefined,
            },
          },
        },
      },
    });

    const form = mkFormData({
      [FORM_NAMES.categories]: [],
    });

    await createSharedApp(TENANT, {}, form);

    expect(mutateCreateSharedApp).toHaveBeenCalledWith(
      TENANT,
      newName('My App 42'),
      expect.objectContaining({
        categories: [],
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
  });

  it('returns mapped errors when mutation returns errors array', async () => {
    (mutateCreateSharedApp as jest.Mock).mockResolvedValue({
      error: mkCombinedGraphQLError('Boom'),
      data: undefined,
    });

    const form = mkFormData();
    const state = await createSharedApp(TENANT, {}, form);

    expect(mutateCreateSharedApp).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state).toEqual({ errors: { general: ['Boom'] } });
  });

  it('returns generic error and preserve data when mutation throws', async () => {
    (mutateCreateSharedApp as jest.Mock).mockRejectedValue(
      new Error('Network'),
    );

    const form = mkFormData();
    const state = await createSharedApp(TENANT, {}, form);

    expect(mutateCreateSharedApp).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state).toEqual({
      data: expect.objectContaining({}),
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('returns bad request error and preserves data when ApolloError includes bad request', async () => {
    (mutateCreateSharedApp as jest.Mock).mockRejectedValue(
      new CombinedGraphQLErrors({
        errors: [{ message: 'invalid input: bad request' }],
      }),
    );

    const form = mkFormData({ [FORM_NAMES.displayName]: 'Bad Request App' });
    const state = await createSharedApp(TENANT, {}, form);

    expect(mutateCreateSharedApp).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state).toEqual({
      data: expect.objectContaining({
        displayName: 'Bad Request App',
      }),
      errors: {
        general: [
          'Die Anfrage ist ungültig. Bitte überprüfen Sie Ihre Eingaben.',
        ],
      },
    });
  });
});

describe('getSharedApp', () => {
  it('returns state from mkGetState when shared app exists', async () => {
    const imageDigest = digest('sha256', 64);
    (queryGetSharedApp as jest.Mock).mockResolvedValueOnce({
      data: {
        sharedApp: {
          config: {
            displayName: 'App X',
            description: 'desc',
            pictureUri: 'https://picture/path.png',
            categories: SOME_CATEGORIES,
            adminContact: 'user@example.com',
            imageDigest,
            imageRepository: 'repo',
            imageRegistry: 'registry.test',
            registryUsername: 'user1',
          },
        },
      },
    });

    const state = await getSharedApp('tenant-x', 'tool-x');

    expect(queryGetSharedApp).toHaveBeenCalledWith('tenant-x', 'tool-x');
    expect(state).toEqual({
      data: {
        displayName: 'App X',
        description: 'desc',
        pictureUri: 'https://picture/path.png',
        categories: SOME_CATEGORIES,
        contact: 'user@example.com',
        config: {
          imageDigest,
          imageRepository: 'repo',
          imageRegistry: 'registry.test',
          username: 'user1',
        },
      },
    });
    expect(notFound).not.toHaveBeenCalled();
  });

  it('calls notFound when no shared app is returned', async () => {
    (queryGetSharedApp as jest.Mock).mockResolvedValueOnce({
      data: { sharedApp: null },
    });

    await getSharedApp('tenant-x', 'tool-x');

    expect(queryGetSharedApp).toHaveBeenCalledWith('tenant-x', 'tool-x');
    expect(notFound).toHaveBeenCalled();
  });

  it('propagates errors from queryGetSharedApp', async () => {
    (queryGetSharedApp as jest.Mock).mockRejectedValueOnce(new Error('Boom'));

    await expect(getSharedApp('tenant-x', 'tool-x')).rejects.toThrow('Boom');
    expect(queryGetSharedApp).toHaveBeenCalledWith('tenant-x', 'tool-x');
  });
});

describe('updateSharedApp', () => {
  it('returns validation errors and preserves data when invalid', async () => {
    const form = mkFormData({ [FORM_NAMES.contact]: 'not-an-email-or-url' });

    const state = await updateSharedApp(TENANT, 'tool-1', {}, form);

    expect(mutateUpdateSharedApp).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(state.errors?.contact).toHaveLength(1);
    expect(state.data).toEqual({
      displayName: 'My App 42',
      description: 'desc',
      pictureUri: 'https://picture/path.png',
      categories: SOME_CATEGORIES,
      contact: 'not-an-email-or-url',
      config: {
        imageDigest: digest('sha256', 64),
        imageRepository: 'repo',
        imageRegistry: 'registry.test',
        username: '',
      },
    });
  });

  it('updates shared app, revalidates, and returns state on success', async () => {
    const imageDigest = digest('sha256', 64);
    const displayName = 'My App 42';
    (mutateUpdateSharedApp as jest.Mock).mockResolvedValueOnce({
      error: undefined,
      data: {
        tenant: {
          sharedApp: {
            update: {
              config: {
                displayName,
                description: 'desc',
                pictureUri: 'https://new-picture.org/picture.jpg',
                categories: [],
                adminContact: 'user@example.com',
                imageDigest,
                imageRepository: 'repo',
                imageRegistry: 'registry.test',
                registryUsername: 'user',
              },
            },
          },
        },
      },
    });

    const form = mkFormData({
      [FORM_NAMES.username]: 'user',
      [FORM_NAMES.password]: 'secret',
      [FORM_NAMES.pictureUri]: 'https://new-picture.org/picture.jpg',
      [FORM_NAMES.categories]: [],
    });

    const state = await updateSharedApp(TENANT, 'tool-1', {}, form);

    expect(mutateUpdateSharedApp).toHaveBeenCalledWith(TENANT, 'tool-1', {
      displayName,
      description: 'desc',
      pictureUri: 'https://new-picture.org/picture.jpg',
      categories: [],
      adminContact: 'user@example.com',
      image: {
        digest: imageDigest,
        repository: 'repo',
        registry: 'registry.test',
        username: 'user',
        password: 'secret',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state.errors).toBeUndefined();
    expect(state.data).toEqual({
      displayName,
      description: 'desc',
      pictureUri: 'https://new-picture.org/picture.jpg',
      categories: [],
      contact: 'user@example.com',
      config: {
        imageDigest,
        imageRepository: 'repo',
        imageRegistry: 'registry.test',
        username: 'user',
      },
    });
  });

  it('passes undefined credentials when username/password empty', async () => {
    (mutateUpdateSharedApp as jest.Mock).mockResolvedValueOnce({
      error: undefined,
      data: {
        tenant: {
          sharedApp: {
            update: {
              config: {
                displayName: 'My App 42',
                description: 'desc',
                pictureUri: 'https://new-picture.org/picture.jpg',
                categories: SOME_CATEGORIES,
                adminContact: 'user@example.com',
                imageDigest: digest('sha256', 64),
                imageRepository: 'repo',
                imageRegistry: 'registry.test',
                registryUsername: undefined,
              },
            },
          },
        },
      },
    });

    const form = mkFormData({
      [FORM_NAMES.username]: '',
      [FORM_NAMES.password]: '',
    });
    await updateSharedApp(TENANT, 'tool-1', {}, form);

    expect(mutateUpdateSharedApp).toHaveBeenCalledWith(
      TENANT,
      'tool-1',
      expect.objectContaining({
        image: expect.objectContaining({
          username: undefined,
          password: undefined,
        }),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
  });

  it('passes empty uri when pictureUri is empty', async () => {
    (mutateUpdateSharedApp as jest.Mock).mockResolvedValueOnce({
      error: undefined,
      data: {
        tenant: {
          sharedApp: {
            update: {
              config: {
                displayName: 'My App 42',
                description: 'desc',
                categories: SOME_CATEGORIES,
                adminContact: 'user@example.com',
                imageDigest: digest('sha256', 64),
                imageRepository: 'repo',
                imageRegistry: 'registry.test',
                registryUsername: undefined,
              },
            },
          },
        },
      },
    });

    const form = mkFormData({
      [FORM_NAMES.pictureUri]: '',
    });
    await updateSharedApp(TENANT, 'tool-1', {}, form);

    expect(mutateUpdateSharedApp).toHaveBeenCalledWith(
      TENANT,
      'tool-1',
      expect.objectContaining({
        pictureUri: '',
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
  });

  it('passes empty categories list when none were selected', async () => {
    (mutateUpdateSharedApp as jest.Mock).mockResolvedValueOnce({
      error: undefined,
      data: {
        tenant: {
          sharedApp: {
            update: {
              config: {
                displayName: 'My App 42',
                description: 'desc',
                categories: [],
                adminContact: 'user@example.com',
                imageDigest: digest('sha256', 64),
                imageRepository: 'repo',
                imageRegistry: 'registry.test',
                registryUsername: undefined,
              },
            },
          },
        },
      },
    });

    const form = mkFormData({
      [FORM_NAMES.categories]: [],
    });
    await updateSharedApp(TENANT, 'tool-1', {}, form);

    expect(mutateUpdateSharedApp).toHaveBeenCalledWith(
      TENANT,
      'tool-1',
      expect.objectContaining({
        categories: [],
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
  });

  it('returns mapped errors when mutation returns errors array', async () => {
    (mutateUpdateSharedApp as jest.Mock).mockResolvedValueOnce({
      error: mkCombinedGraphQLError('Boom'),
      data: undefined,
    });

    const form = mkFormData();
    const state = await updateSharedApp(TENANT, 'tool-1', {}, form);

    expect(mutateUpdateSharedApp).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state).toEqual({ errors: { general: ['Boom'] } });
  });

  it('returns generic error and preserve data when mutation throws', async () => {
    (mutateUpdateSharedApp as jest.Mock).mockRejectedValueOnce(
      new Error('Network'),
    );

    const form = mkFormData();
    const state = await updateSharedApp(TENANT, 'tool-1', {}, form);

    expect(mutateUpdateSharedApp).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state).toEqual({
      data: expect.objectContaining({}),
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('returns bad request error and preserves data when ApolloError includes bad request', async () => {
    (mutateUpdateSharedApp as jest.Mock).mockRejectedValueOnce(
      new CombinedGraphQLErrors({
        errors: [{ message: 'invalid input: bad request' }],
      }),
    );

    const form = mkFormData({ [FORM_NAMES.displayName]: 'Bad Request App' });
    const state = await updateSharedApp(TENANT, 'tool-1', {}, form);

    expect(mutateUpdateSharedApp).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state).toEqual({
      data: expect.objectContaining({ displayName: 'Bad Request App' }),
      errors: {
        general: [
          'Die Anfrage ist ungültig. Bitte überprüfen Sie Ihre Eingaben.',
        ],
      },
    });
  });

  it('returns conflict error and preserves data when ApolloError includes conflict', async () => {
    (mutateUpdateSharedApp as jest.Mock).mockRejectedValueOnce(
      new CombinedGraphQLErrors({ errors: [{ message: 'conflict' }] }),
    );

    const form = mkFormData({ [FORM_NAMES.displayName]: 'Conflict App' });
    const state = await updateSharedApp(TENANT, 'tool-1', {}, form);

    expect(mutateUpdateSharedApp).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state).toEqual({
      data: expect.objectContaining({ displayName: 'Conflict App' }),
      errors: {
        general: [
          'Ein Shared App mit einem ähnlichen Namen existiert bereits. Bitte wähle einen anderen Namen.',
        ],
      },
    });
  });
});
