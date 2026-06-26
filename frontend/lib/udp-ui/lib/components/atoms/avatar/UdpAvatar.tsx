import { twMerge } from 'tailwind-merge';
import { UdpAvatarTestIds } from '@/lib/components/atoms/avatar/testIds';

export type AvatarOnlineStatus = 'online' | 'offline';

export interface UdpAvatarProps {
  img?: string;
  status?: AvatarOnlineStatus;
  alt?: string;
  className?: string;
}

const statusColorMap: Record<AvatarOnlineStatus, string> = {
  online: 'bg-green-400',
  offline: 'bg-red-400',
};

const StatusIndicator = ({ status }: { status: AvatarOnlineStatus }) => (
  <span
    className={twMerge(
      'top-0 left-7 absolute w-3.5 h-3.5 border-2 border-white rounded-full',
      statusColorMap[status],
    )}
    data-testid={UdpAvatarTestIds.statusIndicator}
  />
);

const UdpAvatar = ({
  status,
  img,
  alt = 'Avatar',
  className = '',
}: UdpAvatarProps) => {
  const statusIndicator = status && <StatusIndicator status={status} />;

  return (
    <div
      className={twMerge('relative', className)}
      data-testid={UdpAvatarTestIds.self}
    >
      {img ? (
        <img
          className='w-10 h-10 rounded-full'
          src={img}
          alt={alt}
          data-testid={UdpAvatarTestIds.image}
        />
      ) : (
        <div className='relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full'>
          <svg
            className='absolute w-12 h-12 text-gray-400 -left-1'
            fill='currentColor'
            viewBox='0 0 20 20'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              fillRule='evenodd'
              d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
              clipRule='evenodd'
            />
          </svg>
        </div>
      )}
      {statusIndicator}
    </div>
  );
};

export default UdpAvatar;
