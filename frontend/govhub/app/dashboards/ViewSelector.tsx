import {
  IcGrid,
  IcList,
  UdpButtonGroup,
  UdpButtonGroupDataArray,
} from 'udp-ui/components';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_VIEW,
  SEARCH_PARAMS,
  ViewType,
} from '@/app/dashboards/_internal/common';

export const ViewSelectorTestIds = {
  self: 'dashboards-view-selector',
};

const ViewSelector = (props: { className?: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryView: string =
    searchParams.get(SEARCH_PARAMS.view) ?? ViewType[DEFAULT_VIEW];
  const viewIndex = ViewType[queryView as keyof typeof ViewType];

  const onViewChange = (view: ViewType) => () => {
    const params = new URLSearchParams(searchParams);
    params.set(SEARCH_PARAMS.view, ViewType[view]);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const options = new UdpButtonGroupDataArray(
    {
      icon: IcList,
      label: 'Liste',
      onSelect: onViewChange(ViewType.list),
    },
    {
      icon: IcGrid,
      label: 'Kacheln',
      onSelect: onViewChange(ViewType.card),
    },
  );

  return (
    <div {...props} data-testid={ViewSelectorTestIds.self}>
      <UdpButtonGroup buttonsData={options} indexSelected={viewIndex} />
    </div>
  );
};

export default ViewSelector;
