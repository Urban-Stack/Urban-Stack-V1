import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import UdpBadgeGroup from './UdpBadgeGroup';

const TEST_LABELS = ['Badge #1', 'Badge #2', 'Badge #3'];

describe('snapshot', () => {
  it('renders badge group as expected', () => {
    const { container } = render(<UdpBadgeGroup labels={TEST_LABELS} />);

    expect(container).toMatchSnapshot();
  });

  it('renders scrollable badge group as expected', () => {
    const { container } = render(
      <UdpBadgeGroup labels={TEST_LABELS} scrollable />,
    );

    expect(container).toMatchSnapshot();
  });
});

describe('badges', () => {
  it('badge group contains one badge for each given label', () => {
    const component = render(<UdpBadgeGroup labels={TEST_LABELS} />);

    TEST_LABELS.forEach((tag) =>
      expect(component.getByText(tag)).toBeVisible(),
    );
  });

  it('badge group is empty if no labels given', () => {
    const { container } = render(<UdpBadgeGroup labels={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
