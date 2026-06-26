import { redirect } from 'next/navigation';
import { mkProjectHref } from '../../../../_lib/resource-api/project';

const ProjectPage = async ({
  params,
}: {
  params: Promise<Record<'tenant' | 'projectname', string>>;
}) => {
  const ps = await params;
  redirect(`${mkProjectHref(ps.tenant, ps.projectname)}/shared-user-groups`);
};

export default ProjectPage;
