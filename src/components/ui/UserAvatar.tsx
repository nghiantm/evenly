import { Avatar, type AvatarProps } from '@chakra-ui/react';
import { getInitials } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface UserAvatarProps extends Omit<AvatarProps, 'name' | 'src'> {
  displayName: string;
  avatarUrl?: string | null;
}

export function UserAvatar({ displayName, avatarUrl, ...rest }: UserAvatarProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!avatarUrl) { setImgSrc(undefined); return; }
    const img = new Image();
    img.onload = () => setImgSrc(avatarUrl);
    img.onerror = () => setImgSrc(undefined);
    img.src = avatarUrl;
  }, [avatarUrl]);

  return (
    <Avatar
      name={getInitials(displayName)}
      src={imgSrc}
      bg="brand.500"
      color="white"
      fontWeight="bold"
      {...rest}
    />
  );
}
