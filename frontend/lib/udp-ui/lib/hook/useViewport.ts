import { useEffect, useState } from 'react';
import { Viewport, ViewportObject } from '@/lib/tailwind/classes.ts';
import { twMerge } from 'tailwind-merge';
import { TestIds } from '@/lib/hook/testIds.ts';

/**
 * Hook providing the current viewport.
 * <p>
 * The viewport to be returned corresponds to the Tailwind breakpoint that currently takes place,
 * or is 'base' for the viewport smaller than the smallest breakpoint.
 * It can be used for comparison with a `BreakpointObject` via relational operators
 * in order to render components conditionally, e.g.:
 * <pre>
 *   {useViewport() < Breakpoint.md ? <Comp1 /> : <Comp2 />}
 * </pre>
 *
 * @return the current viewport
 */
const useViewport: () => ViewportObject = () => {
  const [viewport, setViewport] = useState<ViewportObject>(Viewport.base);

  useEffect(() => {
    const detector = getOrCreateDetector();

    const update = () => {
      const detectorStyle = getComputedStyle(detector, '::before');
      const detectorContent = detectorStyle.content.replace(/"/g, '');
      setViewport(Viewport[detectorContent]);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return viewport;
};

export default useViewport;

// NOTE: class names need to be hardcoded as Tailwind can't detect dynamic class names
const DETECTOR_CLASSES = twMerge(
  "before:content-['base']",
  "sm:before:content-['sm']",
  "md:before:content-['md']",
  "lg:before:content-['lg']",
  "xl:before:content-['xl']",
  "2xl:before:content-['2xl']",
  'hidden before:block',
);

const createDetector = () => {
  const detector = document.createElement('div');
  detector.id = TestIds.viewportDetector;
  detector.className = DETECTOR_CLASSES;
  return detector;
};

const getOrCreateDetector = () =>
  document.getElementById(TestIds.viewportDetector) ??
  (() => document.body.appendChild(createDetector()))();
