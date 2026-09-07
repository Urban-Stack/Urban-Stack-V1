import { AllProjects } from '@/app/_lib/resource-api/graphql/project';

export type Project = {
  readonly name: string;
  readonly tenant: string;
  readonly _tag: 'Project';
};

export const mkProjectHref: (tenant: string, projectName: string) => string = (
  tenant,
  projectName,
) => `/settings/projects/${tenant}/${projectName}`;

export const toProjects: (result: AllProjects) => {
  projects: Project[];
  adminMap: Map<string, Map<string, boolean>>;
} = (result) => ({
  projects: (result.data?.tenants ?? [])
    .flatMap((t) => t.projects)
    .map((p) => mkProject(p.project, p.tenant)),
  adminMap: new Map(
    result.data?.tenants.map((t) => [
      t.tenant,
      new Map(t.projects.map((v) => [v.project, v.admin])),
    ]),
  ),
});

const mkProject: (name: string, tenant: string) => Project = (
  name,
  tenant,
) => ({
  name,
  tenant,
  _tag: 'Project',
});
