import { ZodError } from 'zod';
import { EditPublishedQueryForm, mkStateCreate, NEW_STRING } from './form';
import { CreatePublishedQuery } from '@/app/_lib/resource-api/graphql/vizGroups';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('EditPublishedQueryForm Schema', () => {
  const validData = {
    name: 'valid-name',
    sql: 'SELECT * FROM table',
  };

  it('should pass with valid data', () => {
    expect(() => EditPublishedQueryForm.parse(validData)).not.toThrow();
  });

  describe('name field', () => {
    it('should fail if name is too short', () => {
      expect(() =>
        EditPublishedQueryForm.parse({ ...validData, name: 'ab' }),
      ).toThrow('Query-Name muss mindestens 3 Zeichen beinhalten');
    });

    it('should fail if name is too long', () => {
      expect(() =>
        EditPublishedQueryForm.parse({ ...validData, name: 'a'.repeat(65) }),
      ).toThrow('Query-Name darf maximal 64 Zeichen beinhalten');
    });

    it(`should fail if name is exactly "${NEW_STRING}"`, () => {
      expect(() =>
        EditPublishedQueryForm.parse({ ...validData, name: NEW_STRING }),
      ).toThrow(ZodError);
    });

    it('should fail if name contains uppercase letters', () => {
      expect(() =>
        EditPublishedQueryForm.parse({ ...validData, name: 'Invalid-Name' }),
      ).toThrow(
        'Query-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
      );
    });

    it('should fail if name contains special characters', () => {
      expect(() =>
        EditPublishedQueryForm.parse({ ...validData, name: 'invalid$name' }),
      ).toThrow(
        'Query-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
      );
    });
  });

  describe('sql field', () => {
    it.each(['', ' '])('should fail for empty sql', (sql) => {
      expect(() =>
        EditPublishedQueryForm.parse({ ...validData, sql }),
      ).toThrow();
    });
  });
});

describe('mkState', () => {
  it('returns errors with mapped error messages', () => {
    const result: CreatePublishedQuery = {
      error: mkCombinedGraphQLError('Error 1', 'Error 2'),
      data: undefined,
    };

    const state = mkStateCreate(result);

    expect(state.errors?.general).toEqual(['Error 1', 'Error 2']);
  });

  it('returns generic error if no data and no errors', () => {
    const result: CreatePublishedQuery = {
      error: undefined,
      data: undefined,
    };

    const state = mkStateCreate(result);

    expect(state.errors?.general).toEqual([
      'Ein unbekannter Fehler ist aufgetreten',
    ]);
  });

  it('returns correct data on success', () => {
    const publishedQueryName = 'geojson-layer';
    const publishedQuerySql = 'SELECT * FROM geo';

    const result: CreatePublishedQuery = {
      error: undefined,
      data: {
        tenant: {
          vizGroup: {
            createPublishedQuery: {
              publishedQuery: publishedQueryName,
              config: {
                sql: publishedQuerySql,
              },
            },
          },
        },
      },
    };

    const state = mkStateCreate(result);

    expect(state.data?.name).toEqual(publishedQueryName);
    expect(state.data?.sql).toEqual(publishedQuerySql);
  });
});
