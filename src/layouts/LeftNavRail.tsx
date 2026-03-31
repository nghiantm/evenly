import {
  Box, VStack, HStack, Text, Divider, Tooltip,
  Skeleton, Avatar, IconButton,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUser, useClerk } from '@clerk/clerk-react';
import { usersService } from '@/services/users';
import { groupsService } from '@/services/groups';
import { balancesService } from '@/services/balances';
import { C } from '@/lib/colors';
import { formatCurrency, getInitials } from '@/lib/utils';
import { useWorkspaceActions } from './WorkspaceActionsContext';

const NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: '◈' },
  { label: 'Profile',   to: '/profile',   icon: '◎' },
];

interface LeftNavRailProps {
  onClose?: () => void;
}

export function LeftNavRail({ onClose }: LeftNavRailProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { openNewGroup, currentGroupId } = useWorkspaceActions();

  const { data: profile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn:  usersService.getMe,
    staleTime: 5 * 60_000,
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn:  groupsService.list,
    staleTime: 60_000,
  });

  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ['balances', 'me'],
    queryFn:  balancesService.getMyBalances,
    staleTime: 60_000,
  });

  const activeGroups = (groups ?? []).filter(g => !g.archivedAt);

  const displayName   = user?.fullName || profile?.displayName || 'You';
  const email         = profile?.email || user?.primaryEmailAddress?.emailAddress || '';
  const defaultCurrency = profile?.defaultCurrency ?? 'USD';
  const net = (balances?.youAreOwed ?? 0) - (balances?.youOwe ?? 0);

  return (
    <VStack align="stretch" spacing={0} h="full" overflow="hidden">

      {/* ── Logo ── */}
      <HStack spacing={2.5} px={4} py={4} flexShrink={0}>
        <Box
          w={7} h={7} bg="brand.500" borderRadius="md"
          display="flex" alignItems="center" justifyContent="center"
          flexShrink={0}
        >
          <Text color="white" fontWeight={800} fontSize="sm" fontFamily="mono">E</Text>
        </Box>
        <Text fontWeight={700} fontSize="sm" color={C.text} letterSpacing="0.03em">
          EVENLY
        </Text>
      </HStack>

      <Divider borderColor={C.border} />

      {/* ── Navigation ── */}
      <VStack align="stretch" spacing={0.5} px={2} py={3} flexShrink={0}>
        <Text
          fontSize="10px" color={C.textMuted} letterSpacing="0.1em"
          textTransform="uppercase" fontWeight={700} px={2} mb={1}
        >
          Navigate
        </Text>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={onClose}>
            {({ isActive }) => (
              <HStack
                spacing={2.5} px={2.5} py={2} borderRadius="md"
                bg={isActive ? C.greenDim : 'transparent'}
                borderLeft="2px solid"
                borderColor={isActive ? C.green : 'transparent'}
                color={isActive ? C.green : C.textSub}
                fontWeight={isActive ? 600 : 400}
                _hover={{ bg: C.hover, color: C.text, borderColor: isActive ? C.green : 'transparent' }}
                transition="all 0.12s"
                cursor="pointer"
              >
                <Text fontSize="md" w={5} textAlign="center" flexShrink={0}>
                  {item.icon}
                </Text>
                <Text fontSize="sm">{item.label}</Text>
              </HStack>
            )}
          </NavLink>
        ))}
      </VStack>

      <Divider borderColor={C.border} />

      {/* ── Groups ── */}
      <VStack align="stretch" spacing={0} flexShrink={0}>
        {/* Groups header */}
        <HStack px={3} py={2.5} justify="space-between">
          <HStack spacing={1.5}>
            <Text
              fontSize="10px" color={C.textMuted} letterSpacing="0.1em"
              textTransform="uppercase" fontWeight={700}
            >
              Groups
            </Text>
            {activeGroups.length > 0 && (
              <Text fontSize="10px" color={C.textMuted} fontFamily="mono">
                ({activeGroups.length})
              </Text>
            )}
          </HStack>
          <Tooltip label="New Group" placement="right" hasArrow>
            <IconButton
              aria-label="New Group"
              icon={<AddIcon boxSize={2.5} />}
              size="xs"
              variant="ghost"
              color={C.textMuted}
              _hover={{ color: C.green, bg: C.greenDim }}
              onClick={() => { openNewGroup(); onClose?.(); }}
            />
          </Tooltip>
        </HStack>

        {/* Groups list */}
        <VStack align="stretch" spacing={0} pb={1}>
          {groupsLoading ? (
            <VStack spacing={1.5} px={3} py={2}>
              {[1, 2, 3].map(i => <Skeleton key={i} h={3} borderRadius="sm" />)}
            </VStack>
          ) : activeGroups.length === 0 ? (
            <Box px={4} py={2}>
              <Text fontSize="xs" color={C.textMuted} fontStyle="italic">No groups yet</Text>
            </Box>
          ) : (
            activeGroups.map(group => (
              <GroupNavItem
                key={group.groupId}
                groupId={group.groupId}
                name={group.name}
                currency={group.defaultCurrency}
                isActive={group.groupId === currentGroupId}
                onClick={() => {
                  navigate(`/groups/${group.groupId}`);
                  onClose?.();
                }}
              />
            ))
          )}
        </VStack>
      </VStack>

      <Divider borderColor={C.border} />

      {/* ── Balance Summary ── */}
      <Box px={3} py={3} flexShrink={0}>
        <Text
          fontSize="10px" color={C.textMuted} letterSpacing="0.1em"
          textTransform="uppercase" fontWeight={700} mb={2.5}
        >
          My Balance
        </Text>

        {balancesLoading ? (
          <VStack align="stretch" spacing={1.5}>
            <Skeleton h={4} borderRadius="sm" />
            <Skeleton h={4} borderRadius="sm" />
          </VStack>
        ) : (
          <VStack align="stretch" spacing={1}>
            <BalanceRow label="You owe"     amount={balances?.youOwe ?? 0}      currency={defaultCurrency} negative />
            <BalanceRow label="Owed to you" amount={balances?.youAreOwed ?? 0}  currency={defaultCurrency} />
            <Divider borderColor={C.border} my={1} />
            <HStack justify="space-between">
              <Text fontSize="10px" color={C.textMuted} letterSpacing="0.05em" textTransform="uppercase">Net</Text>
              <Text fontSize="xs" fontFamily="mono" fontWeight={700} color={net >= 0 ? C.green : C.red}>
                {net >= 0 ? '+' : ''}{formatCurrency(net, defaultCurrency)}
              </Text>
            </HStack>
          </VStack>
        )}
      </Box>

      {/* ── Spacer ── */}
      <Box flex={1} />

      <Divider borderColor={C.border} />

      {/* ── Health ── */}
      <HealthDot />

      {/* ── User ── */}
      <VStack align="stretch" spacing={0} borderTop="1px solid" borderColor={C.border} flexShrink={0}>
        <HStack spacing={2.5} px={3} py={3}>
          <Avatar
            size="xs"
            name={getInitials(displayName)}
            src={profile?.avatarUrl ?? undefined}
            bg="brand.500"
            color="white"
            flexShrink={0}
          />
          <VStack align="start" spacing={0} flex={1} minW={0}>
            <Text fontSize="xs" fontWeight={600} color={C.text} noOfLines={1}>{displayName}</Text>
            <Text fontSize="10px" color={C.textMuted} noOfLines={1}>{email}</Text>
          </VStack>
        </HStack>
        <HStack
          px={3} py={2}
          spacing={2}
          cursor="pointer"
          color={C.textMuted}
          _hover={{ color: C.red, bg: C.hover }}
          transition="all 0.1s"
          borderTop="1px solid" borderColor={C.border}
          onClick={() => signOut(() => navigate('/sign-in'))}
        >
          <SignOutIcon />
          <Text fontSize="xs">Sign out</Text>
        </HStack>
      </VStack>
    </VStack>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GroupNavItem({
  groupId, name, currency, isActive, onClick,
}: {
  groupId: string;
  name: string;
  currency: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <HStack
      spacing={2} pl={6} pr={3} py={1.5}
      bg={isActive ? C.greenDim : 'transparent'}
      borderLeft="2px solid"
      borderColor={isActive ? C.green : 'transparent'}
      color={isActive ? C.green : C.textSub}
      _hover={{ bg: C.hover, color: C.text }}
      transition="all 0.1s"
      cursor="pointer"
      onClick={onClick}
      minW={0}
    >
      <Text fontSize="xs" fontWeight={isActive ? 600 : 400} noOfLines={1} flex={1}>
        {name}
      </Text>
      <Text fontSize="10px" fontFamily="mono" color={isActive ? C.green : C.textMuted} flexShrink={0}>
        {currency}
      </Text>
    </HStack>
  );
}


function BalanceRow({
  label, amount, currency, negative,
}: { label: string; amount: number; currency: string; negative?: boolean }) {
  return (
    <HStack justify="space-between">
      <Text fontSize="10px" color={C.textMuted} letterSpacing="0.04em">{label}</Text>
      <Text fontSize="xs" fontFamily="mono" fontWeight={600} color={negative ? C.red : C.green}>
        {negative ? '-' : '+'}{formatCurrency(amount, currency)}
      </Text>
    </HStack>
  );
}

function SignOutIcon() {
  return (
    <Box as="svg" viewBox="0 0 24 24" w={3.5} h={3.5} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Box>
  );
}

function HealthDot() {
  return (
    <HStack spacing={1.5} px={3} py={2}>
      <Box w={1.5} h={1.5} borderRadius="full" bg={C.green} flexShrink={0} />
      <Text fontSize="10px" color={C.textMuted} letterSpacing="0.04em">
        Connection online
      </Text>
    </HStack>
  );
}
