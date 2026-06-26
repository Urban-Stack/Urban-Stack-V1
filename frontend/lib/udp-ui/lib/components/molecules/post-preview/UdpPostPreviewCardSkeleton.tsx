import { twMerge } from 'tailwind-merge';
import { SHARED_CLASSES } from './util.ts';

interface UdpPostPreviewCardSkeletonProps {
  className?: string;
}

const UdpPostPreviewCardSkeleton = ({
  className,
}: UdpPostPreviewCardSkeletonProps) => (
  <div
    className={twMerge(
      SHARED_CLASSES,
      'border-gray-200 animate-pulse',
      className,
    )}
  >
    <div className='h-2 bg-gray-200 rounded-full w-32 mb-1.5'></div>
    <div className='h-3 bg-gray-200 rounded-full'></div>
    <div className='h-3 bg-gray-200 rounded-full w-5/6'></div>
  </div>
);

export default UdpPostPreviewCardSkeleton;
