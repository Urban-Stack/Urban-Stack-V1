export const mkHref = (
  tenant: string,
  vizgroup: string,
  query: string = 'new',
) => `/settings/dashboardgroups/${tenant}/${vizgroup}/geojson/${query}`;

export const mkResultHref = (
  tenant: string,
  vizgroup: string,
  query: string,
  pubqueryUri: string,
) => `${pubqueryUri}/api/v2/query/${tenant}/${vizgroup}/${query}/geojson`;
