'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type ScrollFadeProps = {
  children: ReactNode;
  'data-testid'?: string;
};

/**
 * Wraps a scrollable child and overlays white-to-transparent gradients on
 * whichever sides still have hidden content. Expects its first child to be
 * the actual scroll container (e.g. a UdpBadgeGroup with scrollable).
 */
const ScrollFade = ({ children, 'data-testid': testId }: ScrollFadeProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const scrollEl = ref.current!.firstElementChild as HTMLElement;

    const update = () => {
      setShowLeft(scrollEl.scrollLeft > 0);
      setShowRight(
        scrollEl.scrollLeft < scrollEl.scrollWidth - scrollEl.clientWidth - 1,
      );
    };

    update();
    scrollEl.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(scrollEl);

    return () => {
      scrollEl.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className='relative' ref={ref} data-testid={testId}>
      {children}
      {showLeft && (
        <div
          className='absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none'
          aria-hidden='true'
        />
      )}
      {showRight && (
        <div
          className='absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none'
          aria-hidden='true'
        />
      )}
    </div>
  );
};

export default ScrollFade;
