import { render } from '@testing-library/react';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';

const FALLBACKS: ReadonlyArray<FallbackContext> = [
  {
    predicate: () => false,
    title: 'Fallback #1',
    description: 'This is the first fallback',
  },
  {
    predicate: () => false,
    title: 'Fallback #2',
    description: 'This is the second fallback',
  },
  {
    predicate: () => false,
    title: 'Fallback #3',
    description: 'This is the third fallback',
  },
];
const fallbackWithCond = (index: number, value: boolean) => ({
  ...FALLBACKS[index],
  ...{ predicate: () => value },
});
const TEST_COMPONENT_ID = 'test-component-id';

describe('snapshot', () => {
  it('matches snapshot for no fallback', () => {
    const fallbacks = [
      fallbackWithCond(0, false),
      fallbackWithCond(1, false),
      fallbackWithCond(2, false),
    ];

    const { container } = render(
      <SettingsFallbackWrapper fallbacks={fallbacks}>
        <div data-testid={TEST_COMPONENT_ID}>test</div>
      </SettingsFallbackWrapper>,
    );

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for fallback', () => {
    const fallbacks = [
      fallbackWithCond(0, false),
      fallbackWithCond(1, true),
      fallbackWithCond(2, true),
    ];

    const { container } = render(
      <SettingsFallbackWrapper fallbacks={fallbacks}>
        <div data-testid={TEST_COMPONENT_ID}>test</div>
      </SettingsFallbackWrapper>,
    );

    expect(container).toMatchSnapshot();
  });
});

describe('conditional', () => {
  it('chooses the first fallback context the predicate of which is evaluated to true', () => {
    const fallbacks = [
      fallbackWithCond(0, false),
      fallbackWithCond(1, true), // to be shown
      fallbackWithCond(2, true),
    ];

    const component = render(
      <SettingsFallbackWrapper fallbacks={fallbacks}>
        <div data-testid={TEST_COMPONENT_ID}>test</div>
      </SettingsFallbackWrapper>,
    );
    const container = component.container;

    expect(component.queryByTestId(TEST_COMPONENT_ID)).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent(fallbacks[0].title);
    expect(container).not.toHaveTextContent(fallbacks[0].description);
    expect(container).toHaveTextContent(fallbacks[1].title);
    expect(container).toHaveTextContent(fallbacks[1].description);
    expect(container).not.toHaveTextContent(fallbacks[2].title);
    expect(container).not.toHaveTextContent(fallbacks[2].description);
  });

  it('renders the child component if no fallback predicate is evaluated to true', () => {
    const fallbacks = [
      fallbackWithCond(0, false),
      fallbackWithCond(1, false),
      fallbackWithCond(2, false),
    ];

    const component = render(
      <SettingsFallbackWrapper fallbacks={fallbacks}>
        <div data-testid={TEST_COMPONENT_ID}>test</div>
      </SettingsFallbackWrapper>,
    );
    const container = component.container;

    expect(component.queryByTestId(TEST_COMPONENT_ID)).toBeVisible();
    expect(container).not.toHaveTextContent(fallbacks[0].title);
    expect(container).not.toHaveTextContent(fallbacks[0].description);
    expect(container).not.toHaveTextContent(fallbacks[1].title);
    expect(container).not.toHaveTextContent(fallbacks[1].description);
    expect(container).not.toHaveTextContent(fallbacks[2].title);
    expect(container).not.toHaveTextContent(fallbacks[2].description);
  });
});
