import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import UdpCard, { UdpCardColor } from './UdpCard';
import IcGlobe from '@/lib/components/icons/solid/IcGlobe.tsx';
import { UdpCardTestIds } from './testIds';

describe('UdpCard', () => {
  it.each<UdpCardColor>(UdpCardColor)(
    'matches snapshot for color %s',
    (color) => {
      const { container } = render(
        <UdpCard
          title='Title'
          description='description'
          icon={IcGlobe}
          color={color}
        >
          hello world
        </UdpCard>,
      );

      expect(container).toMatchSnapshot();
    },
  );

  it('contains all required elements', () => {
    const { getByTestId } = render(
      <UdpCard
        title='Title'
        description='description'
        icon={IcGlobe}
        color='primary'
      >
        hello world
      </UdpCard>,
    );

    Object.values(UdpCardTestIds).forEach((testId) => {
      expect(getByTestId(testId)).toBeInTheDocument();
    });
  });

  it('hides header when no title or description is provided', () => {
    const { queryByTestId } = render(<UdpCard>hello world</UdpCard>);

    expect(queryByTestId(UdpCardTestIds.header)).not.toBeInTheDocument();
  });
});
