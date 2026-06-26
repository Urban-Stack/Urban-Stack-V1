import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useViewport from './useViewport';
import { Viewport } from '@/lib/tailwind/classes.ts';
import { TestIds } from '@/lib/hook/testIds.ts';

const DETECTOR_ID = TestIds.viewportDetector;

beforeEach(() => {
  document.getElementById(DETECTOR_ID)?.remove();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useViewport', () => {
  describe('detector', () => {
    it('viewport detector matches snapshot', () => {
      renderHook(() => useViewport());

      expect(document.body).toMatchSnapshot();
    });

    it('adds viewport detector if not already present', () => {
      expect(document.getElementById(DETECTOR_ID)).not.toBeInTheDocument();

      renderHook(() => useViewport());

      expect(document.getElementById(DETECTOR_ID)).toBeInTheDocument();
    });

    it('does not add viewport detector if already present', () => {
      const detectorBefore = document.createElement('div');
      detectorBefore.id = DETECTOR_ID;
      detectorBefore.textContent = 'test-detector';
      document.body.appendChild(detectorBefore);
      expect(document.getElementById(DETECTOR_ID)).toBeInTheDocument();

      renderHook(() => useViewport());

      const detectorAfter = document.getElementById(DETECTOR_ID);
      expect(detectorAfter).toBe(detectorBefore);
    });

    it('viewport detector contains content class for each viewport', () => {
      renderHook(() => useViewport());

      const detector = document.getElementById(DETECTOR_ID);
      expect(detector).toHaveClass("before:content-['base']");
      expect(detector).toHaveClass("sm:before:content-['sm']");
      expect(detector).toHaveClass("md:before:content-['md']");
      expect(detector).toHaveClass("lg:before:content-['lg']");
      expect(detector).toHaveClass("xl:before:content-['xl']");
      expect(detector).toHaveClass("2xl:before:content-['2xl']");
    });
  });

  describe('viewport', () => {
    const mockDetectorStyle = (content: string) =>
      vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
        return {
          get content() {
            return content;
          },
        } as CSSStyleDeclaration;
      });

    it("initially returns 'base' viewport", () => {
      mockDetectorStyle('"base"');

      const { result } = renderHook(() => useViewport());

      expect(result.current).toEqual(Viewport.base);
    });

    it.each(Object.values(Viewport))(
      "updates viewport on resize to viewport '%s'",
      (viewport) => {
        const { result } = renderHook(() => useViewport());

        act(() => {
          mockDetectorStyle(`"${viewport}"`);
          window.dispatchEvent(new Event('resize'));
        });

        expect(result.current).toEqual(viewport);
      },
    );
  });
});
