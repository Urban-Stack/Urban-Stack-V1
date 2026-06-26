import { mkMetadata } from '@/app/meta';
import { NEW_STRING } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/form';
import CreateForm from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/CreateForm';
import { getSingleSubscription } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/actions';

export const generateMetadata = mkMetadata({
  pageName: ({ name }) =>
    name === NEW_STRING ? 'Neue Subscription' : 'Subscription Bearbeiten',
});

const EditSubscriptionPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; projectname: string; name: string }>;
}) => {
  const _params = await params;
  const tenant = _params.tenant;
  const project = _params.projectname;
  const subscriptionName = _params.name;

  const subscription =
    subscriptionName == NEW_STRING
      ? {}
      : await getSingleSubscription(tenant, project, subscriptionName);

  return (
    <CreateForm
      tenant={tenant}
      project={project}
      subscription={subscription}
      subscriptionName={subscriptionName}
    />
  );
};

export default EditSubscriptionPage;
