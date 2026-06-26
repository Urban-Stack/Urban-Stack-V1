import React, { useEffect, useRef } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { registerResetListener } from '@/lib/components/molecules/form/misc/misc.tsx';

const TestComponent = ({
  resetFunction,
}: {
  resetFunction: ReturnType<typeof vi.fn>;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return registerResetListener(inputRef, resetFunction);
  }, [resetFunction]);

  return (
    <form>
      <input ref={inputRef} data-testid='test-input' />
      <button type='reset'>Reset</button>
    </form>
  );
};

describe('registerResetListener', () => {
  it('calls resetFunction when form is reset', () => {
    const resetFunction = vi.fn();
    const { container } = render(
      <TestComponent resetFunction={resetFunction} />,
    );

    const form = container.querySelector('form');

    fireEvent.reset(form!);

    expect(resetFunction).toHaveBeenCalledTimes(1);
  });
});
