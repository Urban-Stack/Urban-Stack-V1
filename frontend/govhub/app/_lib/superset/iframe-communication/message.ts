/* c8 ignore start */
export type Message = SqlQuery;

interface SqlQuery {
  readonly sql: string;
  readonly _tag: 'SqlQuery';
}

const SqlQuery = (sql: string): SqlQuery => ({
  sql,
  _tag: 'SqlQuery',
});

export const internal = {
  SqlQuery,
};
