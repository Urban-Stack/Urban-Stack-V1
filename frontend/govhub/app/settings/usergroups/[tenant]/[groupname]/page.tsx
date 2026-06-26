import { redirect } from 'next/navigation';
import { mkUserGroupHref } from '@/app/settings/usergroups/_internal/util';

const UserGroupPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; groupname: string }>;
}) => {
  const { tenant, groupname } = await params;
  redirect(`${mkUserGroupHref(tenant, groupname)}/shared-user-groups`);
};

export default UserGroupPage;
