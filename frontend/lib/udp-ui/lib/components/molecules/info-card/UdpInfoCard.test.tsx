import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import UdpInfoCard, { type UdpInfoCardProps } from './UdpInfoCard.tsx';
import { IcChartPie } from '@/lib/components';
import { UdpInfoCardTestIds } from '@/lib/components/molecules/info-card/testIds.ts';

const FIRST_HREF = '/first';
const SECOND_HREF = '/second';
const THIRD_HREF = '/third';
const LINK_HREF = '/link';

const DefaultCard = ({ ...props }: Partial<UdpInfoCardProps>) => (
  <UdpInfoCard
    icon={IcChartPie}
    title='Dashboards der Stadt Gütersloh'
    description='Hier finden Sie Dashboards der Stadt Gütersloh.'
    items={[
      { icon: IcChartPie, text: 'Stadt Gesundheit', href: FIRST_HREF },
      { icon: IcChartPie, text: 'Umwelt', href: SECOND_HREF },
      { icon: IcChartPie, text: 'Verkehr', href: THIRD_HREF },
    ]}
    linkText='Alle Dashboards ansehen'
    linkHref={LINK_HREF}
    {...props}
  />
);

describe('snapshots', () => {
  it('matches snapshot', () => {
    const component = render(<DefaultCard />);

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with custom class', () => {
    const component = render(
      <DefaultCard className='border-2 border-cyan-500' />,
    );

    expect(component).toMatchSnapshot();
  });
});

describe('link', () => {
  it('Card item links to corresponding page', () => {
    const component = render(<DefaultCard />);

    const itemDiv = component.getByTestId(UdpInfoCardTestIds.items);
    const itemAnchors = itemDiv.querySelectorAll('a');
    expect(itemAnchors.item(0)).toHaveAttribute('href', FIRST_HREF);
    expect(itemAnchors.item(1)).toHaveAttribute('href', SECOND_HREF);
    expect(itemAnchors.item(2)).toHaveAttribute('href', THIRD_HREF);
  });

  it('Card link links to corresponding page', () => {
    const component = render(<DefaultCard />);

    const linkElement = component.getByTestId(UdpInfoCardTestIds.link);
    expect(linkElement).toHaveAttribute('href', LINK_HREF);
  });
});
