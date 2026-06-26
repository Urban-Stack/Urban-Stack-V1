import { ActionState } from '@/app/_lib/form/actionstate';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';
import { z } from 'zod';
import {
  CreatePublishedQuery,
  SinglePublishedQuery,
} from '@/app/_lib/resource-api/graphql/vizGroups';

export const NEW_STRING = 'new';

export const FORM_NAMES = {
  name: 'edit-published-query-name',
  sql: 'edit-published-query-sql',
} as const;

export const EditPublishedQueryForm = z.object({
  name: z
    .string()
    .min(3, 'Query-Name muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Query-Name darf maximal 64 Zeichen beinhalten')
    .regex(
      new RegExp(`^(?!${NEW_STRING}$).+$`),
      `Query-Name darf nicht "${NEW_STRING}" sein`,
    )
    .regex(
      /^[a-z0-9-]+$/,
      'Query-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
    ),
  sql: z.string().trim().nonempty('SQL-Abfrage darf nicht leer sein'),
});

export type EditPublishedQueryForm = z.infer<typeof EditPublishedQueryForm>;

export type PublishedQueryState = ActionState & {
  readonly data?: {
    readonly name: string;
    readonly sql: string;
  };
  readonly errors?: {
    readonly general?: string[];
    readonly name?: string[];
    readonly sql?: string[];
  };
};

export const mkStateCreate: (
  result: CreatePublishedQuery,
) => PublishedQueryState = (result) =>
  result.error || !result.data?.tenant.vizGroup.createPublishedQuery
    ? {
        errors: {
          general: getResultGeneralErrors(
            result.error,
            'Ein unbekannter Fehler ist aufgetreten',
          ),
        },
      }
    : {
        data: {
          name: result.data.tenant.vizGroup.createPublishedQuery.publishedQuery,
          sql: result.data.tenant.vizGroup.createPublishedQuery.config.sql,
        },
      };

export const mkStateSingle: (
  result: SinglePublishedQuery,
) => PublishedQueryState = (result) =>
  result.error || !result.data?.publishedQuery
    ? {
        errors: {
          general: getResultGeneralErrors(
            result.error,
            'Ein unbekannter Fehler ist aufgetreten',
          ),
        },
      }
    : {
        data: {
          name: result.data.publishedQuery.publishedQuery,
          sql: result.data.publishedQuery.config.sql,
        },
      };
