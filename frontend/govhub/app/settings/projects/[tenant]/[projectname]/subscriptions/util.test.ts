import { mkHref } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/util';

const TENANT = 'tenant-1';
const PROJECT = 'project-1';
const SUBSCRIPTION = 'subscribidi';

describe('mkHref', () => {
  it('forms correct href with subscription', async () => {
    const href = mkHref(TENANT, PROJECT, SUBSCRIPTION);

    expect(href).toEqual(
      `/settings/projects/${TENANT}/${PROJECT}/subscriptions/${SUBSCRIPTION}`,
    );
  });

  it('forms correct href without subscription', async () => {
    const href = mkHref(TENANT, PROJECT);

    expect(href).toEqual(
      `/settings/projects/${TENANT}/${PROJECT}/subscriptions/new`,
    );
  });
});
