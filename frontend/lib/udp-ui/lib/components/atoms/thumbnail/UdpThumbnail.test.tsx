import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import UdpThumbnail from './UdpThumbnail';
import { IcDashboardFallback } from '@/lib/components/icons';
import { UdpThumbnailTestIds } from '@/lib/components/atoms/thumbnail/testIds';

const TEST_SRC = './klosebrothers-logo.svg';

describe('snapshot', () => {
  it('matches snapshot', () => {
    const component = render(<UdpThumbnail src={TEST_SRC} />);

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when loading', () => {
    const component = render(<UdpThumbnail src={TEST_SRC} isLoading={true} />);

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when no image', () => {
    const component = render(<UdpThumbnail src={undefined} />);

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot for alt image', () => {
    const component = render(
      <UdpThumbnail src={undefined} altImage={IcDashboardFallback} />,
    );

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const component = render(
      <UdpThumbnail src={TEST_SRC} className={'pt-8'} />,
    );

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes for thumbnail image', () => {
    const component = render(<UdpThumbnail src={TEST_SRC} classImg={'p-8'} />);

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes for alt image', () => {
    const component = render(
      <UdpThumbnail
        src={undefined}
        altImage={IcDashboardFallback}
        classAlt={'p-8'}
      />,
    );

    expect(component).toMatchSnapshot();
  });
});

describe('layers', () => {
  it('does not contain alt image if undefined', () => {
    const component = render(
      <UdpThumbnail src={TEST_SRC} altImage={undefined} />,
    );
    const altImage = component.queryByTestId(UdpThumbnailTestIds.alt);

    expect(altImage).not.toBeInTheDocument();
    expect(component.getByTestId(UdpThumbnailTestIds.overlay)).toBeVisible();
    expect(component.getByTestId(UdpThumbnailTestIds.thumbnail)).toBeVisible();
  });

  it('does not contain thumbnail image if undefined', () => {
    const component = render(
      <UdpThumbnail src={undefined} altImage={IcDashboardFallback} />,
    );
    const thumbnail = component.queryByTestId(UdpThumbnailTestIds.thumbnail);

    expect(thumbnail).not.toBeInTheDocument();
    expect(component.getByTestId(UdpThumbnailTestIds.overlay)).toBeVisible();
    expect(component.getByTestId(UdpThumbnailTestIds.alt)).toBeVisible();
  });
});
