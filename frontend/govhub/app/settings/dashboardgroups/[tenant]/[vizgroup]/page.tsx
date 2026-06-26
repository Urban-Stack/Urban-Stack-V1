import { redirect } from 'next/navigation';
import { mkVizGroupHref } from '@/app/_lib/resource-api/viz-groups/vizGroups';

const VizGroupPage = async ({
  params,
}: {
  params: Promise<Record<'tenant' | 'vizgroup', string>>;
}) => {
  const ps = await params;
  redirect(`${mkVizGroupHref(ps.tenant, ps.vizgroup)}/shared-user-groups`);
};

export default VizGroupPage;
