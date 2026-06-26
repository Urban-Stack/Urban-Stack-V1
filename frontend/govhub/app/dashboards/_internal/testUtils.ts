import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';

export const VIZ_GROUPS: VizGroup[] = [
  {
    name: 'sccon',
    tenant: 'guetersloh',
    _tag: 'VizGroup',
  },
  {
    name: 'abwasser',
    tenant: 'detmold',
    _tag: 'VizGroup',
  },
] as const;
