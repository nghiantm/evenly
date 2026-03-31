import { Badge, type BadgeProps } from '@chakra-ui/react';
import type { GroupRole } from '@/types';

const ROLE_COLOR: Record<GroupRole, string> = {
  OWNER: 'purple',
  ADMIN: 'blue',
  MEMBER: 'gray',
};

interface RoleBadgeProps extends Omit<BadgeProps, 'colorScheme'> {
  role: GroupRole;
}

export function RoleBadge({ role, ...rest }: RoleBadgeProps) {
  return (
    <Badge colorScheme={ROLE_COLOR[role]} {...rest}>
      {role}
    </Badge>
  );
}
