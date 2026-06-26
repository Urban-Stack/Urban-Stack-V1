'use client';

import { useDiscourse, userImageUrl } from '@/app/_lib/discourse/discourse';
import { UdpAvatar } from 'udp-ui/components';

export interface AppUserAvatarProps {
  discourseBaseUrl: string;
}

const AppUserAvatar = ({ discourseBaseUrl }: AppUserAvatarProps) => {
  const { useCurrentUser } = useDiscourse(discourseBaseUrl);
  const { currentUser } = useCurrentUser();

  const image = currentUser && userImageUrl(discourseBaseUrl)(currentUser);

  return <UdpAvatar img={image} alt='Benutzereinstellungen' />;
};

export default AppUserAvatar;
