import {
  Box, VStack, HStack, Text, Skeleton, SkeletonText,
  Divider, Avatar,
} from '@chakra-ui/react';
import { useMatch, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { balancesService } from '@/services/balances';
import { groupsService } from '@/services/groups';
import { usersService } from '@/services/users';
import { expensesService } from '@/services/expenses';
import { settlementsService } from '@/services/settlements';
import { CurrencyAmount } from '@/components/ui/CurrencyAmount';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { PanelSection } from '@/components/workspace/PanelSection';
import { MetricCard } from '@/components/workspace/MetricCard';
import { C } from '@/lib/colors';
import { formatCurrency, getInitials } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';

export function RightContextPanel() {
  const groupMatch = useMatch('/groups/:groupId');
  const groupId = groupMatch?.params?.groupId;

  if (groupId) return <GroupContextPanel groupId={groupId} />;

  const isDashboard = window.location.pathname === '/dashboard' || window.location.pathname === '/';
  const isGroups    = window.location.pathname === '/groups';
  const isProfile   = window.location.pathname === '/profile';

  // Use explicit match hooks for reactive updates
  return <RoutedPanel />;
}

function RoutedPanel() {
  const groupMatch   = useMatch('/groups/:groupId');
  const dashMatch    = useMatch('/dashboard');
  const rootMatch    = useMatch('/');
  const groupsMatch  = useMatch('/groups');
  const profileMatch = useMatch('/profile');

  if (groupMatch?.params?.groupId) return <GroupContextPanel groupId={groupMatch.params.groupId} />;
  if (dashMatch || rootMatch)      return <DashboardContextPanel />;
  if (groupsMatch)                 return <GroupsContextPanel />;
  if (profileMatch)                return <ProfileContextPanel />;
  return <DefaultPanel />;
}

// ─── Dashboard Panel ──────────────────────────────────────────────────────────

function DashboardContextPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['balances', 'me'],
    queryFn:  balancesService.getMyBalances,
    staleTime: 60_000,
  });
  const { data: groups, isLoading: gLoad } = useQuery({
    queryKey: ['groups'],
    queryFn:  groupsService.list,
    staleTime: 60_000,
  });
  const { data: profile } = useQuery({ queryKey: ['users', 'me'], queryFn: usersService.getMe });
  const currency = profile?.defaultCurrency ?? 'USD';

  const activeGroups = groups?.filter(g => !g.archivedAt) ?? [];
  const net = (data?.youAreOwed ?? 0) - (data?.youOwe ?? 0);

  return (
    <PanelContainer>
      <PanelLabel>Financial Overview</PanelLabel>

      <PanelSection label="Net Balance">
        {isLoading ? <Skeleton h={8} /> : (
          <MetricCard
            label=""
            value={formatCurrency(Math.abs(net), currency)}
            sub={net >= 0 ? 'in your favour' : 'you owe overall'}
            valueColor={net >= 0 ? C.green : C.red}
            size="lg"
          />
        )}
      </PanelSection>

      <PanelSection label="Overview">
        <VStack align="stretch" spacing={2}>
          <StatRow label="Active groups"    value={String(activeGroups.length)} />
          <StatRow
            label="You owe"
            value={isLoading ? '—' : formatCurrency(data?.youOwe ?? 0, currency)}
            valueColor={C.red}
          />
          <StatRow
            label="Owed to you"
            value={isLoading ? '—' : formatCurrency(data?.youAreOwed ?? 0, currency)}
            valueColor={C.green}
          />
        </VStack>
      </PanelSection>

      {(data?.netByUser?.length ?? 0) > 0 && (
        <PanelSection label="Top Debts">
          <VStack align="stretch" spacing={2}>
            {data!.netByUser.slice(0, 4).map(u => (
              <HStack key={u.userId} justify="space-between">
                <Text fontSize="xs" color={C.textSub} noOfLines={1}>{u.displayName}</Text>
                <Text
                  fontSize="xs" fontFamily="mono" fontWeight={600}
                  color={u.netAmount > 0 ? C.green : C.red}
                >
                  {u.netAmount > 0 ? '+' : ''}{formatCurrency(u.netAmount, u.currency ?? currency)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </PanelSection>
      )}

      {(data?.netByGroup?.length ?? 0) > 0 && (
        <PanelSection label="By Group" noBorder>
          <VStack align="stretch" spacing={2}>
            {data!.netByGroup.slice(0, 5).map(g => (
              <HStack key={g.groupId} justify="space-between">
                <Text
                  as={Link}
                  to={`/groups/${g.groupId}`}
                  fontSize="xs"
                  color={C.textSub}
                  noOfLines={1}
                  _hover={{ color: C.green }}
                >
                  {g.groupName}
                </Text>
                <Text
                  fontSize="xs" fontFamily="mono" fontWeight={600}
                  color={g.netAmount >= 0 ? C.green : C.red}
                >
                  {g.netAmount >= 0 ? '+' : ''}{formatCurrency(g.netAmount, g.currency ?? currency)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </PanelSection>
      )}
    </PanelContainer>
  );
}

// ─── Groups List Panel ────────────────────────────────────────────────────────

function GroupsContextPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn:  groupsService.list,
    staleTime: 60_000,
  });
  const active = data?.filter(g => !g.archivedAt) ?? [];

  // Aggregate stats
  const totalMembers  = active.reduce((s, g) => s + g.memberCount, 0);
  const byCurrency    = active.reduce<Record<string, number>>((acc, g) => {
    acc[g.defaultCurrency] = (acc[g.defaultCurrency] ?? 0) + 1;
    return acc;
  }, {});
  const byRole = active.reduce<Record<string, number>>((acc, g) => {
    acc[g.myRole] = (acc[g.myRole] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PanelContainer>
      <PanelLabel>Groups Overview</PanelLabel>

      <PanelSection label="Summary">
        {isLoading ? <SkeletonText noOfLines={3} spacing={2} /> : (
          <VStack align="stretch" spacing={2}>
            <StatRow label="Active groups" value={String(active.length)} />
            <StatRow label="Total members" value={String(totalMembers)} />
            <StatRow label="Archived"      value={String((data?.length ?? 0) - active.length)} />
          </VStack>
        )}
      </PanelSection>

      {Object.keys(byCurrency).length > 0 && (
        <PanelSection label="By Currency">
          <VStack align="stretch" spacing={1.5}>
            {Object.entries(byCurrency).map(([cur, count]) => (
              <StatRow key={cur} label={cur} value={`${count} group${count !== 1 ? 's' : ''}`} />
            ))}
          </VStack>
        </PanelSection>
      )}

      {Object.keys(byRole).length > 0 && (
        <PanelSection label="My Roles" noBorder>
          <VStack align="stretch" spacing={1.5}>
            {Object.entries(byRole).map(([role, count]) => (
              <StatRow key={role} label={role} value={`${count} group${count !== 1 ? 's' : ''}`} />
            ))}
          </VStack>
        </PanelSection>
      )}
    </PanelContainer>
  );
}

// ─── Group Detail Panel ───────────────────────────────────────────────────────

function GroupContextPanel({ groupId }: { groupId: string }) {
  const { data: profile } = useQuery({ queryKey: ['users', 'me'], queryFn: usersService.getMe });
  const currentUserId = profile?.userId ?? '';

  const { data: group, isLoading: gLoad } = useQuery({
    queryKey: ['groups', groupId],
    queryFn:  () => groupsService.getById(groupId),
    staleTime: 60_000,
  });
  const { data: balances, isLoading: bLoad } = useQuery({
    queryKey: ['balances', groupId, group?.defaultCurrency ?? 'USD'],
    queryFn:  () => balancesService.getGroupBalances(groupId, group?.defaultCurrency ?? 'USD'),
    enabled:  !!group,
    staleTime: 60_000,
  });
  const { data: expenses } = useQuery({
    queryKey: ['expenses', groupId, 1],
    queryFn:  () => expensesService.list(groupId, { page: 1, page_size: 3 }),
    enabled:  !!group,
    staleTime: 30_000,
  });

  const myBalance = balances?.userBalances.find(b => b.userId === currentUserId);
  const getMemberName = (uid: string) =>
    uid === currentUserId ? 'You' : group?.members.find(m => m.userId === uid)?.displayName ?? uid.slice(0, 8);

  return (
    <PanelContainer>
      <PanelLabel>{group?.name ?? '—'}</PanelLabel>

      {/* Members */}
      <PanelSection label={`Members (${group?.memberCount ?? '—'})`}>
        {gLoad ? <SkeletonText noOfLines={3} spacing={2} /> : (
          <VStack align="stretch" spacing={1.5}>
            {group?.members.slice(0, 6).map(m => (
              <HStack key={m.userId} justify="space-between">
                <HStack spacing={2}>
                  <Avatar
                    size="xs"
                    name={getInitials(m.displayName)}
                    src={m.avatarUrl ?? undefined}
                    bg="brand.500" color="white"
                  />
                  <Text fontSize="xs" color={C.textSub} noOfLines={1}>
                    {m.userId === currentUserId ? `${m.displayName} (you)` : m.displayName}
                  </Text>
                </HStack>
                <RoleBadge role={m.role} />
              </HStack>
            ))}
            {(group?.memberCount ?? 0) > 6 && (
              <Text fontSize="10px" color={C.textMuted}>
                +{(group?.memberCount ?? 0) - 6} more
              </Text>
            )}
          </VStack>
        )}
      </PanelSection>

      {/* Balances */}
      <PanelSection label={`Balances (${group?.defaultCurrency})`}>
        {bLoad ? <Skeleton h={12} /> : !balances ? null : (
          <VStack align="stretch" spacing={2}>
            {myBalance && (
              <Box
                px={2.5} py={2} bg={myBalance.netAmount >= 0 ? C.greenDim : C.redDim}
                borderRadius="md" border="1px solid"
                borderColor={myBalance.netAmount >= 0 ? 'brand.700' : 'red.800'}
              >
                <Text fontSize="10px" color={C.textMuted} mb={0.5}>YOUR NET</Text>
                <Text
                  fontFamily="mono" fontWeight={700} fontSize="sm"
                  color={myBalance.netAmount >= 0 ? C.green : C.red}
                >
                  {myBalance.netAmount >= 0 ? '+' : ''}{formatCurrency(myBalance.netAmount, group?.defaultCurrency ?? 'USD')}
                </Text>
              </Box>
            )}
            {balances.pairwiseDebts.slice(0, 4).map((d, i) => {
              const isMe = d.fromUserId === currentUserId;
              const isMeTo = d.toUserId === currentUserId;
              return (
                <HStack key={i} justify="space-between">
                  <Text fontSize="xs" color={C.textSub} noOfLines={1}>
                    <Text as="span" color={isMe ? C.red : C.textSub}>{getMemberName(d.fromUserId)}</Text>
                    <Text as="span" color={C.textMuted}> → </Text>
                    <Text as="span" color={isMeTo ? C.green : C.textSub}>{getMemberName(d.toUserId)}</Text>
                  </Text>
                  <Text fontSize="xs" fontFamily="mono" fontWeight={600}
                    color={isMe ? C.red : isMeTo ? C.green : C.textSub}
                  >
                    {formatCurrency(d.amount, d.currency)}
                  </Text>
                </HStack>
              );
            })}
          </VStack>
        )}
      </PanelSection>

      {/* Recent Expenses */}
      {expenses && expenses.expenses.length > 0 && (
        <PanelSection label="Recent Expenses">
          <VStack align="stretch" spacing={2}>
            {expenses.expenses.slice(0, 3).map(e => (
              <HStack key={e.expenseId} justify="space-between">
                <Text fontSize="xs" color={C.textSub} noOfLines={1} flex={1}>{e.description}</Text>
                <Text fontSize="xs" fontFamily="mono" fontWeight={600} color={C.textSub}>
                  {formatCurrency(e.totalAmount, e.currency)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </PanelSection>
      )}

      {/* Stats */}
      <PanelSection label="Stats" noBorder>
        <VStack align="stretch" spacing={1.5}>
          <StatRow label="Expenses"    value={String(group?.recentExpenseCount ?? '—')} />
          <StatRow label="Settlements" value={String(group?.recentSettlementCount ?? '—')} />
          <StatRow label="Currency"    value={group?.defaultCurrency ?? '—'} />
        </VStack>
      </PanelSection>
    </PanelContainer>
  );
}

// ─── Profile Panel ────────────────────────────────────────────────────────────

function ProfileContextPanel() {
  const { user } = useUser();
  const { data: profile } = useQuery({ queryKey: ['users', 'me'], queryFn: usersService.getMe });
  const { data: groups }   = useQuery({ queryKey: ['groups'], queryFn: groupsService.list });
  const activeGroups = groups?.filter(g => !g.archivedAt) ?? [];

  return (
    <PanelContainer>
      <PanelLabel>Account</PanelLabel>

      <PanelSection label="Identity">
        <VStack align="stretch" spacing={2}>
          <StatRow label="Status"   value={profile?.status ?? '—'} valueColor={C.green} />
          <StatRow label="Verified" value={profile?.emailVerified ? 'Yes ✓' : 'No'} />
          <StatRow label="Currency" value={profile?.defaultCurrency ?? '—'} />
        </VStack>
      </PanelSection>

      <PanelSection label="Membership">
        <VStack align="stretch" spacing={2}>
          <StatRow label="Active groups" value={String(activeGroups.length)} />
          <StatRow label="Total groups"  value={String(groups?.length ?? '—')} />
        </VStack>
      </PanelSection>

      <PanelSection label="Clerk ID" noBorder>
        <Text
          fontSize="10px" fontFamily="mono" color={C.textMuted}
          wordBreak="break-all"
        >
          {user?.id ?? '—'}
        </Text>
      </PanelSection>
    </PanelContainer>
  );
}

// ─── Default Panel ────────────────────────────────────────────────────────────

function DefaultPanel() {
  return (
    <PanelContainer>
      <PanelLabel>Context</PanelLabel>
      <PanelSection label="Status" noBorder>
        <Text fontSize="xs" color={C.textMuted}>
          Select a section to see contextual data here.
        </Text>
      </PanelSection>
    </PanelContainer>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function PanelContainer({ children }: { children: React.ReactNode }) {
  return (
    <Box h="full" overflowY="auto">
      <VStack align="stretch" spacing={0}>
        {children}
      </VStack>
    </Box>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <Box px={4} py={3} borderBottom="1px solid" borderColor={C.border}>
      <Text
        fontSize="10px" color={C.textMuted} letterSpacing="0.12em"
        textTransform="uppercase" fontWeight={700}
      >
        {children}
      </Text>
    </Box>
  );
}

function StatRow({
  label, value, valueColor,
}: { label: string; value: string; valueColor?: string }) {
  return (
    <HStack justify="space-between">
      <Text fontSize="xs" color={C.textMuted}>{label}</Text>
      <Text fontSize="xs" fontFamily="mono" fontWeight={600} color={valueColor ?? C.textSub}>
        {value}
      </Text>
    </HStack>
  );
}
