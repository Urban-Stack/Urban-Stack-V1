import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ScrollFade from './ScrollFade';

class ResizeObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
}

const LABELS = ['A', 'B', 'C', 'D', 'E'];

const ScrollChild = ({
  scrollLeft = 0,
  scrollWidth = 200,
  clientWidth = 100,
}: {
  scrollLeft?: number;
  scrollWidth?: number;
  clientWidth?: number;
}) => {
  return (
    <div
      data-testid='scroll-child'
      style={{ overflowX: 'auto' }}
      ref={(el) => {
        if (!el) return;
        Object.defineProperty(el, 'scrollLeft', {
          value: scrollLeft,
          configurable: true,
        });
        Object.defineProperty(el, 'scrollWidth', {
          value: scrollWidth,
          configurable: true,
        });
        Object.defineProperty(el, 'clientWidth', {
          value: clientWidth,
          configurable: true,
        });
      }}
    >
      {LABELS.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );
};

describe('ScrollFade', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children', () => {
    render(
      <ScrollFade>
        <ScrollChild />
      </ScrollFade>,
    );
    expect(screen.getByTestId('scroll-child')).toBeInTheDocument();
  });

  it('shows right overlay when scrollable to the right', () => {
    const { container } = render(
      <ScrollFade>
        <ScrollChild scrollLeft={0} scrollWidth={200} clientWidth={100} />
      </ScrollFade>,
    );
    // scrollLeft (0) < scrollWidth (200) - clientWidth (100) → right overlay shown
    const overlays = container.querySelectorAll('[aria-hidden="true"]');
    expect(overlays).toHaveLength(1);
    expect(overlays[0]).toHaveClass('bg-gradient-to-l');
  });

  it('shows no overlays when content fits without scrolling', () => {
    const { container } = render(
      <ScrollFade>
        <ScrollChild scrollLeft={0} scrollWidth={100} clientWidth={100} />
      </ScrollFade>,
    );
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);
  });

  it('shows left overlay when scrolled to the right', () => {
    const { container } = render(
      <ScrollFade>
        <ScrollChild scrollLeft={100} scrollWidth={200} clientWidth={100} />
      </ScrollFade>,
    );
    const overlays = container.querySelectorAll('[aria-hidden="true"]');
    // scrollLeft (100) > 0 → left overlay; scrollLeft (100) >= scrollWidth (200) - clientWidth (100) → no right overlay
    expect(overlays).toHaveLength(1);
    expect(overlays[0]).toHaveClass('bg-gradient-to-r');
  });

  it('shows both overlays when scrolled to middle', () => {
    const { container } = render(
      <ScrollFade>
        <ScrollChild scrollLeft={50} scrollWidth={200} clientWidth={100} />
      </ScrollFade>,
    );
    const overlays = container.querySelectorAll('[aria-hidden="true"]');
    expect(overlays).toHaveLength(2);
  });

  it('forwards data-testid to wrapper', () => {
    render(
      <ScrollFade data-testid='my-fade'>
        <ScrollChild />
      </ScrollFade>,
    );
    expect(screen.getByTestId('my-fade')).toBeInTheDocument();
  });

  it('updates overlays on scroll event', async () => {
    const scrollLeft = 0;
    const { container } = render(
      <ScrollFade>
        <ScrollChild
          scrollLeft={scrollLeft}
          scrollWidth={200}
          clientWidth={100}
        />
      </ScrollFade>,
    );

    const scrollEl = container.querySelector(
      '[data-testid="scroll-child"]',
    ) as HTMLElement;

    // Simulate scrolling right
    Object.defineProperty(scrollEl, 'scrollLeft', {
      value: 50,
      configurable: true,
    });
    await act(async () => {
      scrollEl.dispatchEvent(new Event('scroll'));
    });

    const overlays = container.querySelectorAll('[aria-hidden="true"]');
    expect(overlays).toHaveLength(2);
  });
});
