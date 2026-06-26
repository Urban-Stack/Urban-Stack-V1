import { mkHelpdeskRedirectHref } from './util';

jest.mock('@/app/_lib/resource-api/client', () => ({
  mutate: jest.fn(),
}));

jest.mock('@/app/__generated__', () => ({
  graphql: jest.fn(() => 'MOCK_GRAPHQL_QUERY'),
}));

describe('mkHelpdeskRedirectHref', () => {
  it('returns correct href for empty string given', () => {
    const error = '';

    const result = mkHelpdeskRedirectHref(error);

    expect(result).toEqual('/helpdesk?error=');
  });

  it('returns correct href for non-empty string given', () => {
    const error = 'Lmao error';

    const result = mkHelpdeskRedirectHref(error);

    expect(result).toEqual('/helpdesk?error=Lmao+error');
  });
});
