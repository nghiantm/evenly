import { Avatar, type AvatarProps } from '@chakra-ui/react';
import { getInitials } from '@/lib/utils';

interface UserAvatarProps extends Omit<AvatarProps, 'name' | 'src'> {
  displayName: string;
  avatarUrl?: string | null;
}

export function UserAvatar({ displayName, avatarUrl, ...rest }: UserAvatarProps) {
  return (
    <Avatar
      name={getInitials(displayName)}
      src={avatarUrl ?? undefined}
      bg="brand.500"
      color="white"
      fontWeight="bold"
      {...rest}
    />
  );
}
