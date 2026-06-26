import { EditSharedAppForm, mkCreateState } from './form';
import { CreateSharedApp } from '@/app/_lib/resource-api/graphql/sharedApps';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { CITYTOOL_CATEGORY_ORDER } from '@/app/citytools/_internal/categories';

const repeat = (ch: string, n: number) => new Array(n + 1).join(ch);
const hex = (n: number) => repeat('a', n);
const digest = (algo: string, n: number) => `${algo}:${hex(n)}`;

const base = () => ({
  displayName: 'abc',
  description: '',
  pictureUri: 'https://path/to/picture.png',
  categories: [],
  contact: 'user@example.com',
  imageDigest: digest('sha256', 64),
  imageRepository: 'repo-123',
  imageRegistry: 'https://registry.example.com',
});

const SOME_CATEGORIES = CITYTOOL_CATEGORY_ORDER.slice(1, 3);

describe('EditSharedAppForm', () => {
  it.each([
    [{}, 'missing all required fields'],
    [{ ...base(), displayName: 'ab' }, 'displayName < 3'],
    [{ ...base(), displayName: repeat('a', 65) }, 'displayName > 64'],
    [{ ...base(), description: repeat('d', 256) }, 'description > 255'],
    [{ ...base(), pictureUri: repeat('z', 8) }, 'not a valid picture uri'],
    [{ ...base(), contact: repeat('x', 256) }, 'contact > 255'],
    [
      {
        ...base(),
        contact: 'not-an-email-or-url',
      },
      'contact neither email nor url',
    ],
    [{ ...base(), imageDigest: hex(64) }, 'digest missing algo and colon'],
    [{ ...base(), imageDigest: digest('sha256', 31) }, 'digest hex < 32'],
    [{ ...base(), imageRepository: 'ab' }, 'imageRepository < 3'],
    [{ ...base(), imageRepository: repeat('r', 65) }, 'imageRepository > 64'],
    [{ ...base(), imageRegistry: 'ur' }, 'imageRegistry < 3'],
    [{ ...base(), username: repeat('u', 65) }, 'username present but > 64'],
    [{ ...base(), password: repeat('p', 256) }, 'password present but > 255'],
    [
      {
        displayName: 'ab',
        description: repeat('d', 256),
        contact: 'bad',
        imageDigest: digest('sha256', 31),
        imageRepository: 'x',
        imageRegistry: 'not-a-url',
        username: 'a',
        password: repeat('p', 256),
      },
      'multiple violations',
    ],
    [
      {
        ...base(),
        categories: ['OFFICE', 'not-valid', 'INTELLIGENT_AUTOMATION'],
      },
      'invalid category value',
    ],
  ])('rejects invalid: %s (%s)', (obj, _) => {
    expect(() => EditSharedAppForm.parse(obj)).toThrow();
  });

  it.each([
    [{ ...base() }, 'minimal valid'],
    [{ ...base(), description: '' }, 'description length 0'],
    [{ ...base(), description: repeat('d', 255) }, 'description length 255'],
    [{ ...base(), displayName: repeat('a', 3) }, 'displayName length 3'],
    [{ ...base(), displayName: repeat('b', 64) }, 'displayName length 64'],
    [
      {
        ...base(),
        contact: 'person.name+tag@sub.domain.tld',
      },
      'contact as email',
    ],
    [
      {
        ...base(),
        contact: 'https://contact.example.com/path?q=1#x',
      },
      'contact as url',
    ],
    [{ ...base(), imageDigest: digest('sha256', 64) }, 'sha256 with 64 hex'],
    [{ ...base(), imageDigest: digest('md5', 32) }, 'other algo with >=32 hex'],
    [{ ...base(), imageDigest: digest('sha384', 96) }, 'sha384 with 96 hex'],
    [
      {
        ...base(),
        imageRepository: repeat('r', 3),
      },
      'imageRepository length 3',
    ],
    [
      {
        ...base(),
        imageRepository: repeat('s', 64),
      },
      'imageRepository length 64',
    ],
    [
      {
        ...base(),
        imageRegistry: 'http://localhost:5000',
      },
      'imageRegistry valid url',
    ],
    [
      {
        ...base(),
        username: undefined,
        password: undefined,
      },
      'optional creds omitted',
    ],
    [{ ...base(), username: repeat('u', 2) }, 'username length 2'],
    [{ ...base(), username: repeat('v', 64) }, 'username length 64'],
    [{ ...base(), password: '' }, 'password empty string'],
    [{ ...base(), password: repeat('p', 255) }, 'password length 255'],
    [
      {
        ...base(),
        username: 'ok',
        password: 'secret',
      },
      'optional creds provided valid',
    ],
    [
      {
        ...base(),
        categories: SOME_CATEGORIES,
      },
      'optional categories match available ones',
    ],
  ])('accepts valid: %s (%s)', (obj, _) => {
    expect(() => EditSharedAppForm.parse(obj)).not.toThrow();
  });
});

describe('mkState', () => {
  it('maps GraphQL error to general errors', () => {
    const result: CreateSharedApp = {
      error: new CombinedGraphQLErrors({
        errors: [{ message: 'Boom' }, { message: 'Kaboom' }],
      }),
      data: undefined,
    };

    const state = mkCreateState(result);

    expect(state.errors?.general).toEqual(['Boom\nKaboom']);
  });

  it('returns a generic error when data is missing', () => {
    const result: CreateSharedApp = {
      error: undefined,
      data: undefined,
    };

    const state = mkCreateState(result);

    expect(state.errors?.general).toEqual([
      'Ein unbekannter Fehler ist aufgetreten.',
    ]);
  });

  it('maps successful response to state data (with username)', () => {
    const result: CreateSharedApp = {
      error: undefined,
      data: {
        tenant: {
          createSharedApp: {
            sharedApp: 'name-1',
            config: {
              displayName: 'My App',
              description: 'desc',
              pictureUri: 'https://path/to/picture.png',
              categories: SOME_CATEGORIES,
              adminContact: 'user@example.com',
              imageDigest: digest('sha256', 64),
              imageRepository: 'repo',
              imageRegistry: 'https://registry.example.com',
              registryUsername: 'registry-user',
            },
          },
        },
      },
    };

    const state = mkCreateState(result);

    expect(state.errors).toBeUndefined();
    expect(state.data).toEqual({
      displayName: 'My App',
      description: 'desc',
      pictureUri: 'https://path/to/picture.png',
      categories: SOME_CATEGORIES,
      contact: 'user@example.com',
      config: {
        imageDigest: result.data!.tenant.createSharedApp.config.imageDigest,
        imageRepository:
          result.data!.tenant.createSharedApp.config.imageRepository,
        imageRegistry: result.data!.tenant.createSharedApp.config.imageRegistry,
        username: 'registry-user',
      },
    });
  });

  it('sets username to undefined when not provided', () => {
    const result: CreateSharedApp = {
      error: undefined,
      data: {
        tenant: {
          createSharedApp: {
            sharedApp: 'name-1',
            config: {
              displayName: 'My App',
              description: 'desc',
              pictureUri: 'https://path/to/picture.png',
              categories: SOME_CATEGORIES,
              adminContact: 'user@example.com',
              imageDigest: digest('sha256', 64),
              imageRepository: 'repo',
              imageRegistry: 'https://registry.example.com',
              registryUsername: undefined,
            },
          },
        },
      },
    };

    const state = mkCreateState(result);

    expect(state.data?.config?.username).toBeUndefined();
  });

  it('sets pictureUri to undefined when not provided', () => {
    const result: CreateSharedApp = {
      error: undefined,
      data: {
        tenant: {
          createSharedApp: {
            sharedApp: 'name-1',
            config: {
              displayName: 'My App',
              description: 'desc',
              categories: SOME_CATEGORIES,
              adminContact: 'user@example.com',
              imageDigest: digest('sha256', 64),
              imageRepository: 'repo',
              imageRegistry: 'https://registry.example.com',
              registryUsername: undefined,
            },
          },
        },
      },
    };

    const state = mkCreateState(result);

    expect(state.data?.pictureUri).toBeUndefined();
  });
});
