import { internal, toStaticApps } from './internal';
import { QueriedPublicStaticApps } from '@/app/_lib/resource-api/graphql/staticApps';
import { CitytoolCategory } from '@/app/__generated__/types';

const TENANT = 'guetersloh';

describe('mkStaticApp', () => {
  it('creates a static app object with correct properties', () => {
    const tool = internal.mkStaticApp(
      'Test Tool',
      '/test/path',
      'any description',
      [],
    );
    expect(tool).toEqual({
      displayName: 'Test Tool',
      finalPath: '/test/path',
      description: 'any description',
      categories: [],
      _tag: 'StaticApp',
    });
  });
});

describe('toStaticApps', () => {
  it('correctly creates static apps from query result', () => {
    const mockResult: Partial<QueriedPublicStaticApps> = {
      data: {
        publicCitytools: [
          {
            displayName: 'Tool 1',
            description: 'Description 1',
            categories: [CitytoolCategory.Office, CitytoolCategory.AppsTools],
            path: 'tool1',
            indexPath: '/index',
          },
          {
            displayName: 'Tool 2',
            description: 'Description 2',
            categories: [CitytoolCategory.Office],
            path: 'tool2',
            indexPath: null,
          },
          {
            displayName: 'Tool 3',
            description: 'Description 3',
            categories: [],
            path: 'tool3',
            indexPath: null,
          },
        ],
      },
    };

    const result = toStaticApps(mockResult as QueriedPublicStaticApps, TENANT);

    expect(result).toEqual([
      {
        displayName: 'Tool 1',
        finalPath: 'guetersloh/tool1/index',
        description: 'Description 1',
        categories: [CitytoolCategory.Office, CitytoolCategory.AppsTools],
        _tag: 'StaticApp',
      },
      {
        displayName: 'Tool 2',
        finalPath: 'guetersloh/tool2',
        description: 'Description 2',
        categories: [CitytoolCategory.Office],
        _tag: 'StaticApp',
      },
      {
        displayName: 'Tool 3',
        finalPath: 'guetersloh/tool3',
        description: 'Description 3',
        categories: [],
        _tag: 'StaticApp',
      },
    ]);
  });

  it.each([
    ['both present', '/index', 'guetersloh/tool1/index'],
    ['no index path', undefined, 'guetersloh/tool1'],
  ])(
    'handles path and indexPath correctly for %s',
    (_, indexPath, expected) => {
      const mockResult: Partial<QueriedPublicStaticApps> = {
        data: {
          publicCitytools: [
            {
              displayName: 'Tool 1',
              description: 'Description 1',
              categories: [],
              path: 'tool1',
              indexPath,
            },
          ],
        },
      };
      const staticApp = toStaticApps(
        mockResult as QueriedPublicStaticApps,
        TENANT,
      )[0];
      expect(staticApp.finalPath).toEqual(expected);
    },
  );

  it('handles empty result correctly', () => {
    const mockResult: Partial<QueriedPublicStaticApps> = {
      data: { publicCitytools: [] },
    };

    const result = toStaticApps(mockResult as QueriedPublicStaticApps, TENANT);

    expect(result).toEqual([]);
  });
});
