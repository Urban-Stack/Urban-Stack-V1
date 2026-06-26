import { describe, expect, it, vi } from 'vitest';
import UdpScrollWrapper from '@/lib/components/atoms/scroll-wrapper/UdpScrollWrapper.tsx';
import { ScrollWrapperTestIds as TestIds } from '@/lib/components/atoms/scroll-wrapper/testIds.ts';
import React from 'react';
import { createRender } from '@/lib/test-utils';

const INVISIBLE = 'opacity-0';
const VISIBLE = 'opacity-100';

type ScrollProps = 'clientWidth' | 'scrollLeft' | 'scrollWidth';

const renderComp = createRender(UdpScrollWrapper, {
  children: <div>test content</div>,
});

describe('snapshot', () => {
  it('matches snapshot', () => {
    const component = renderComp();

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with custom class', () => {
    const component = renderComp({ className: 'pt-8' });

    expect(component).toMatchSnapshot();
  });
});

describe('content', () => {
  it('contains child component and is horizontally scrollable', () => {
    const childTestId = 'child-test-id';
    const { getByTestId } = renderComp({
      children: <div data-testid={childTestId} />,
    });

    const scrollRef = getByTestId(TestIds.ref);
    expect(scrollRef).toContainElement(getByTestId(childTestId));
    expect(scrollRef).toHaveClass('overflow-x-auto');
  });
});

describe('gradients', () => {
  const mockScroll = (mocks: Partial<Record<ScrollProps, number>>) => {
    Object.entries(mocks).forEach(([methodName, mockValue]) => {
      vi.spyOn(
        HTMLElement.prototype,
        methodName as ScrollProps,
        'get',
      ).mockReturnValue(mockValue);
    });
  };

  const effectiveOpacity = (element: HTMLElement) =>
    [...Array.from(element.classList)]
      .reverse()
      .find((cls) => cls.startsWith('opacity-'));

  describe('conditional rendering', () => {
    it('shows no gradients if not scrollable', () => {
      // viewport: ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉
      mockScroll({
        scrollWidth: 20,
        clientWidth: 20,
        scrollLeft: 0,
      });

      const { getByTestId } = renderComp();

      expect(effectiveOpacity(getByTestId(TestIds.gradL))).toEqual(INVISIBLE);
      expect(effectiveOpacity(getByTestId(TestIds.gradR))).toEqual(INVISIBLE);
    });

    it('shows right gradient if right overflow', () => {
      // viewport: ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉░░░░░
      mockScroll({
        scrollWidth: 20,
        clientWidth: 15,
        scrollLeft: 0,
      });

      const { getByTestId } = renderComp();

      expect(effectiveOpacity(getByTestId(TestIds.gradL))).toEqual(INVISIBLE);
      expect(effectiveOpacity(getByTestId(TestIds.gradR))).toEqual(VISIBLE);
    });

    it('shows left gradient if left overflow', () => {
      // viewport: ░░░░░▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉
      mockScroll({
        scrollWidth: 20,
        clientWidth: 15,
        scrollLeft: 5,
      });

      const { getByTestId } = renderComp();

      expect(effectiveOpacity(getByTestId(TestIds.gradL))).toEqual(VISIBLE);
      expect(effectiveOpacity(getByTestId(TestIds.gradR))).toEqual(INVISIBLE);
    });

    it('shows both gradients if overflow on both sides', () => {
      // viewport: ░░░░░▉▉▉▉▉▉▉▉▉▉░░░░░
      mockScroll({
        scrollWidth: 20,
        clientWidth: 10,
        scrollLeft: 5,
      });

      const { getByTestId } = renderComp();

      expect(effectiveOpacity(getByTestId(TestIds.gradL))).toEqual(VISIBLE);
      expect(effectiveOpacity(getByTestId(TestIds.gradR))).toEqual(VISIBLE);
    });
  });

  describe('customization', () => {
    it('applies custom gradient class to gradients', () => {
      const CUSTOM_GRAD = 'grad-test';

      const { getByTestId } = renderComp({ gradClassName: CUSTOM_GRAD });

      expect(getByTestId(TestIds.gradL)).toHaveClass(CUSTOM_GRAD);
      expect(getByTestId(TestIds.gradR)).toHaveClass(CUSTOM_GRAD);
    });

    it('applies custom opacity to gradients if scrollable', () => {
      // viewport: ░░░░░▉▉▉▉▉▉▉▉▉▉░░░░░
      mockScroll({
        scrollWidth: 20,
        clientWidth: 10,
        scrollLeft: 5,
      });
      const OPACITY_X = 'opacity-test';

      const { getByTestId } = renderComp({ gradClassName: OPACITY_X });

      expect(effectiveOpacity(getByTestId(TestIds.gradL))).toEqual(OPACITY_X);
      expect(effectiveOpacity(getByTestId(TestIds.gradR))).toEqual(OPACITY_X);
    });

    it('gradients are always non-opaque if not scrollable (even if custom opacity is specified)', () => {
      // viewport: ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉
      mockScroll({
        scrollWidth: 20,
        clientWidth: 20,
        scrollLeft: 0,
      });

      const { getByTestId } = renderComp({ gradClassName: 'opacity-25' });

      expect(effectiveOpacity(getByTestId(TestIds.gradL))).toEqual('opacity-0');
      expect(effectiveOpacity(getByTestId(TestIds.gradR))).toEqual('opacity-0');
    });
  });
});
