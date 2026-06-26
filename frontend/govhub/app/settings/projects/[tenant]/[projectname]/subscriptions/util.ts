import { SubscriptionState } from '@/app/__generated__/types';

export const mkHref = (
  tenant: string,
  project: string,
  subscription: string = 'new',
) => `/settings/projects/${tenant}/${project}/subscriptions/${subscription}`;

export const subscriptionStateTranslations: Readonly<
  Record<SubscriptionState, string>
> = {
  [SubscriptionState.Connected]: 'Verbunden',
  [SubscriptionState.Connecting]: 'Verbinde…',
  [SubscriptionState.Error]: 'Fehler',
};
