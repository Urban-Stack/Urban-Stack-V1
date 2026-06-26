import { twMerge } from 'tailwind-merge';
import { UdpIcon } from '@/lib/components/icons';
import { UdpThumbnailTestIds } from '@/lib/components/atoms/thumbnail/testIds';

interface UdpThumbnailProps {
  src: string | undefined;
  classImg?: string;
  altImage?: UdpIcon;
  classAlt?: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * Thumbnail component.
 * <p>
 * This component comprises the following layers:
 * <ol>
 *  <li>transparent overlay
 *  <li>thumbnail image
 *  <li>alt image (optional)
 * </ol>
 *
 * @param src       source of the thumbnail image to represent by means of this component, or
 *                  `undefined` if the thumbnail is not (yet) available
 * @param classImg  class name for the thumbnail image of this component
 * @param altImage  type or component of the alt image to show while there is no thumbnail, or
 *                  `undefined` in order to not show any alt image
 * @param classAlt  class name for the alt image of this component
 * @param isLoading `true` if the thumbnail is still loading - `false` otherwise
 * @param className class name for this component
 * @constructor
 */
const UdpThumbnail = ({
  src,
  classImg,
  altImage: AltImage,
  classAlt,
  isLoading = false,
  className,
}: UdpThumbnailProps) => (
  <div
    className={twMerge(
      'overflow-hidden',
      isLoading && 'animate-pulse',
      className,
      'relative',
    )}
    data-testid={UdpThumbnailTestIds.self}
  >
    {AltImage && (
      <AltImage
        data-testid={UdpThumbnailTestIds.alt}
        className={twMerge('size-full', classAlt, 'absolute')}
      />
    )}
    {src && (
      <img
        data-testid={UdpThumbnailTestIds.thumbnail}
        src={src}
        alt={''}
        className={twMerge(classImg, 'absolute')}
      />
    )}
    <div
      data-testid={UdpThumbnailTestIds.overlay}
      className={'absolute size-full bg-primary-200 opacity-[33%]'}
    />
  </div>
);

export default UdpThumbnail;
