'use client';

import React, { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { ScrollWrapperTestIds } from '@/lib/components/atoms/scroll-wrapper/testIds.ts';

export type UdpTableProps = {
  className?: string;
  gradClassName?: string;
  children: React.ReactNode;
};

/**
 * Wrapper for scrollable content having gradients for visual feedback.
 * <p>
 * This is a scrollable container comprising gradients on the left and right side
 * that appear when the content is currently hidden due to an overflow.
 *
 * @param className     class name for this wrapper component
 * @param gradClassName class name for the gradients of this wrapper component
 * @param children      child components for this wrapper component
 *
 * @constructor
 */
const UdpScrollWrapper = ({
  className,
  gradClassName,
  children,
}: UdpTableProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showGradL, setShowGradL] = useState(false);
  const [showGradR, setShowGradR] = useState(false);

  const updateGradients = () => {
    const scrDiv = scrollRef.current!;

    const { scrollLeft, scrollWidth, clientWidth } = scrDiv;
    setShowGradL(scrollLeft > 0);
    setShowGradR(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    const contEl = scrollRef.current!;

    updateGradients();

    contEl.addEventListener('scroll', updateGradients);
    window.addEventListener('resize', updateGradients);
    return () => {
      contEl.removeEventListener('scroll', updateGradients);
      window.removeEventListener('resize', updateGradients);
    };
  }, []);

  return (
    <div className={twMerge('relative udp-scroll-thin', className)}>
      <Gradient
        show={showGradL}
        className={twMerge('bg-gradient-to-r left-0', gradClassName)}
        data-testid={ScrollWrapperTestIds.gradL}
      />
      <Gradient
        show={showGradR}
        className={twMerge('bg-gradient-to-l right-0', gradClassName)}
        data-testid={ScrollWrapperTestIds.gradR}
      />
      <div
        ref={scrollRef}
        className={twMerge(
          'h-full overflow-x-auto',
          `focus:outline-hidden focus:ring-2 focus:ring-primary-300`,
        )}
        data-testid={ScrollWrapperTestIds.ref}
      >
        {children}
      </div>
    </div>
  );
};

export default UdpScrollWrapper;

export type GradientProps = {
  show: boolean;
  className: string;
};

const Gradient = ({ show, className, ...restProps }: GradientProps) => (
  <div
    className={twMerge(
      'absolute pointer-events-none inset-y-0 w-16 z-10',
      'from-white to-transparent opacity-100 transition-opacity duration-350',
      className,
      !show && 'opacity-0',
    )}
    {...restProps}
  />
);
