import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UdpIconButtonColor } from '@/lib/components/atoms/icon-button/UdpIconButton.tsx';
import { IcCog, UdpIconButton } from '@/lib/components';

describe('snapshot', () => {
  it.each(UdpIconButtonColor)('matches snapshot for color `%s`', (color) => {
    const { container } = render(
      <UdpIconButton color={color} icon={IcCog} label={'test label'} />,
    );

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const { container } = render(
      <UdpIconButton icon={IcCog} label={'test label'} className={'px-8'} />,
    );

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with additional icon classes', () => {
    const { container } = render(
      <UdpIconButton icon={IcCog} label={'test label'} classIcon={'size-8'} />,
    );

    expect(container).toMatchSnapshot();
  });
});
