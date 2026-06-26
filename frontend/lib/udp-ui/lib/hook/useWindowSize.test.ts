import { describe, it, expect } from 'vitest';
import useWindowSize from '@/lib/hook/useWindowSize';
import { act, renderHook } from '@testing-library/react';

const triggerResize: (dimension: 'width' | 'height', value: number) => void = (
  dimension,
  value,
) => {
  if (dimension === 'width') {
    window.innerWidth = value;
  } else if (dimension === 'height') {
    window.innerHeight = value;
  }

  window.dispatchEvent(new Event('resize'));
};

describe('useWindowSize', () => {
  it('should return current window dimensions', () => {
    triggerResize('width', 768);
    const { result } = renderHook(useWindowSize);

    expect(result.current.width).toBe(768);
  });

  it('should rerender when window is resized', () => {
    triggerResize('width', 2048);
    const { result } = renderHook(useWindowSize);
    expect(result.current.width).toBe(2048);

    act(() => {
      triggerResize('width', 768);
    });

    expect(result.current.width).toBe(768);
  });
});
