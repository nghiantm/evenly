import {
  Box, VStack, HStack, Text, Grid, Skeleton, SkeletonText,
  Divider, Menu, MenuButton, MenuList, MenuItem, Button,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { balancesService } from '@/services/balances';
import { usersService } from '@/services/users';
import { groupsService } from '@/services/groups';
import { expensesService } from '@/services/expenses';
import { EXPENSE_CATEGORIES } from '@/features/expenses/suggestCategory';
import type { Group } from '@/types';
import { SectionHeader } from '@/components/workspace/SectionHeader';
import { MetricCard } from '@/components/workspace/MetricCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getErrorMessage } from '@/lib/apiClient';
import { formatCurrency } from '@/lib/utils';
import { C } from '@/lib/colors';

export function DashboardPage() {
  const { user } = useUser();
  const { data: profile } = useQuery({ queryKey: ['users', 'me'], queryFn: usersService.getMe });
  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: groupsService.list });
  const { data, isLoading, error } = useQuery({
    queryKey: ['balances', 'me'],
    queryFn:  balancesService.getMyBalances,
    staleTime: 60_000,
  });

  const currency = profile?.defaultCurrency ?? 'USD';
  const net      = (data?.youAreOwed ?? 0) - (data?.youOwe ?? 0);
  const name     = user?.fullName || profile?.displayName || 'there';

  return (
    <Box>
      <SectionHeader
        eyebrow="Overview"
        title={`Hey, ${name}`}
        description="Your balance summary across all groups"
      />

      <Box px={5} py={5}>
        <VStack align="stretch" spacing={6}>
          {error && <ErrorAlert message={getErrorMessage(error)} />}

          {/* ── Top metric strip ── */}
          <Grid
            templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }}
            gap={0}
            border="1px solid"
            borderColor={C.border}
            borderRadius="lg"
            overflow="hidden"
          >
            <MetricStrip
              label="You Owe"
              value={isLoading ? null : formatCurrency(data?.youOwe ?? 0, currency)}
              valueColor={C.red}
              borderRight
            />
            <MetricStrip
              label="Owed to You"
              value={isLoading ? null : formatCurrency(data?.youAreOwed ?? 0, currency)}
              valueColor={C.green}
              borderRight
            />
            <MetricStrip
              label="Net Balance"
              value={isLoading ? null : (net >= 0 ? '+' : '') + formatCurrency(net, currency)}
              valueColor={net >= 0 ? C.green : C.red}
            />
          </Grid>

          {/* ── Two-column data panels ── */}
          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={4}>
            {/* Balance by Group */}
            <DataPanel
              title="Balance by Group"
              isLoading={isLoading}
              isEmpty={!data?.netByGroup?.length}
              emptyText="No group balances yet."
            >
              {data?.netByGroup?.map(g => (
                <DataRow
                  key={g.groupId}
                  left={
                    <Text
                      as={Link}
                      to={`/groups/${g.groupId}`}
                      fontSize="sm"
                      color={C.textSub}
                      _hover={{ color: C.green }}
                      noOfLines={1}
                    >
                      {g.groupName}
                    </Text>
                  }
                  right={
                    <VStack align="end" spacing={0}>
                      <Text
                        fontSize="sm" fontFamily="mono" fontWeight={700}
                        color={g.netAmount >= 0 ? C.green : C.red}
                      >
                        {g.netAmount >= 0 ? '+' : ''}{formatCurrency(g.netAmount, g.currency)}
                      </Text>
                      <Text fontSize="10px" fontFamily="mono" color={C.textMuted}>{g.currency}</Text>
                    </VStack>
                  }
                />
              ))}
            </DataPanel>

            {/* Balance by Person */}
            <DataPanel
              title="Balance by Person"
              isLoading={isLoading}
              isEmpty={!data?.netByUser?.length}
              emptyText="No personal balances yet."
            >
              {data?.netByUser?.map(u => (
                <DataRow
                  key={u.userId}
                  left={
                    <Text fontSize="sm" color={C.textSub} noOfLines={1}>{u.displayName}</Text>
                  }
                  right={
                    <VStack align="end" spacing={0}>
                      <Text
                        fontSize="sm" fontFamily="mono" fontWeight={700}
                        color={u.netAmount >= 0 ? C.green : C.red}
                      >
                        {u.netAmount >= 0 ? '+' : ''}{formatCurrency(u.netAmount, u.currency ?? currency)}
                      </Text>
                      <Text fontSize="10px" color={C.textMuted}>
                        {u.netAmount > 0 ? 'owes you' : u.netAmount < 0 ? 'you owe' : 'settled'}
                      </Text>
                    </VStack>
                  }
                />
              ))}
            </DataPanel>
          </Grid>

          {/* ── Spending by category ── */}
          <SpendingByCategory groups={groups} currency={currency} />
        </VStack>
      </Box>
    </Box>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricStrip({
  label, value, valueColor, borderRight,
}: {
  label: string;
  value: string | null;
  valueColor: string;
  borderRight?: boolean;
}) {
  return (
    <Box
      px={5} py={4}
      borderRight={borderRight ? '1px solid' : 'none'}
      borderColor={C.border}
      bg={C.surface}
    >
      <Text
        fontSize="10px" color={C.textMuted}
        letterSpacing="0.1em" textTransform="uppercase" fontWeight={700} mb={1.5}
      >
        {label}
      </Text>
      {value === null ? (
        <Skeleton h={8} w="70%" borderRadius="sm" />
      ) : (
        <Text fontFamily="mono" fontSize="2xl" fontWeight={800} color={valueColor} lineHeight={1}>
          {value}
        </Text>
      )}
    </Box>
  );
}

function DataPanel({
  title, isLoading, isEmpty, emptyText, children,
}: {
  title: string;
  isLoading: boolean;
  isEmpty: boolean;
  emptyText: string;
  children?: React.ReactNode;
}) {
  return (
    <Box border="1px solid" borderColor={C.border} borderRadius="lg" overflow="hidden" bg={C.surface}>
      {/* Panel header */}
      <Box px={4} py={2.5} borderBottom="1px solid" borderColor={C.border}>
        <Text fontSize="11px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700}>
          {title}
        </Text>
      </Box>

      {/* Panel body */}
      <Box>
        {isLoading ? (
          <Box px={4} py={3}>
            <SkeletonText noOfLines={4} spacing={3} />
          </Box>
        ) : isEmpty ? (
          <Box px={4} py={6} textAlign="center">
            <Text fontSize="sm" color={C.textMuted}>{emptyText}</Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={0} divider={<Divider borderColor={C.border} />}>
            {children}
          </VStack>
        )}
      </Box>
    </Box>
  );
}

// ─── Spending by Category ─────────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  'food & drink':   '#f97316',
  'groceries':      '#22c55e',
  'transport':      '#3b82f6',
  'accommodation':  '#8b5cf6',
  'entertainment':  '#ec4899',
  'utilities':      '#64748b',
  'healthcare':     '#ef4444',
  'shopping':       '#f59e0b',
  'travel':         '#06b6d4',
  'education':      '#6366f1',
  'fitness & sports': '#10b981',
  'personal care':  '#d946ef',
  'fees & charges': '#94a3b8',
  'other':          '#8b949e',
};

function prettifyCategory(cat: string) {
  return cat.replace(/\b\w/g, c => c.toUpperCase());
}

function getMonthOptions(): { value: string; label: string }[] {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
}

const MONTH_OPTIONS = getMonthOptions();

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function SpendingByCategory({ groups, currency }: { groups: Group[]; currency: string }) {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);

  const targetGroups = selectedGroup === 'all'
    ? groups
    : groups.filter(g => g.groupId === selectedGroup);

  const results = useQueries({
    queries: targetGroups.map(g => ({
      queryKey: ['expenses', g.groupId, 'analytics'],
      queryFn: () => expensesService.list(g.groupId, { page_size: 100 }),
      staleTime: 60_000,
    })),
  });

  const isLoading = results.some(r => r.isLoading);

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = Object.fromEntries(
      EXPENSE_CATEGORIES.map(c => [c.toLowerCase(), 0])
    );
    for (const r of results) {
      for (const exp of r.data?.expenses ?? []) {
        if (!exp.expenseDate.startsWith(selectedMonth)) continue;
        const cat = (exp.category ?? 'other').toLowerCase();
        map[cat] = (map[cat] ?? 0) + Number(exp.totalAmount);
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [results, selectedMonth]);

  const maxAmount = categoryTotals.find(([, v]) => v > 0)?.[1] ?? 1;
  const totalSpending = categoryTotals.reduce((sum, [, v]) => sum + Number(v), 0);
  const displayCurrency = selectedGroup === 'all'
    ? currency
    : groups.find(g => g.groupId === selectedGroup)?.defaultCurrency ?? currency;

  const selectedGroupLabel = selectedGroup === 'all'
    ? 'All Groups'
    : groups.find(g => g.groupId === selectedGroup)?.name ?? 'All Groups';
  const selectedMonthLabel = MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label ?? selectedMonth;

  return (
    <Box border="1px solid" borderColor={C.border} borderRadius="lg" overflow="hidden" bg={C.surface}>
      <HStack
        px={4} py={2.5} borderBottom="1px solid" borderColor={C.border}
        justify="space-between" flexWrap="wrap" gap={2}
      >
        <VStack align="start" spacing={0}>
          <Text fontSize="11px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700}>
            Spending by Category
          </Text>
          {isLoading ? (
            <Skeleton h={6} w="100px" borderRadius="sm" mt={0.5} />
          ) : (
            <Text fontFamily="mono" fontSize="xl" fontWeight={800} color={C.text} lineHeight={1.2}>
              {formatCurrency(totalSpending, displayCurrency)}
            </Text>
          )}
        </VStack>
        <HStack spacing={2}>
          <Menu>
            <MenuButton as={Button} size="xs" variant="outline" rightIcon={<ChevronDownIcon />}>
              {selectedGroupLabel}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setSelectedGroup('all')}>All Groups</MenuItem>
              {groups.map(g => (
                <MenuItem key={g.groupId} onClick={() => setSelectedGroup(g.groupId)}>{g.name}</MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} size="xs" variant="outline" rightIcon={<ChevronDownIcon />}>
              {selectedMonthLabel}
            </MenuButton>
            <MenuList maxH="220px" overflowY="auto">
              {MONTH_OPTIONS.map(m => (
                <MenuItem key={m.value} onClick={() => setSelectedMonth(m.value)}>{m.label}</MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>
      </HStack>

      <Box>
        {isLoading ? (
          <Box px={4} py={3}><SkeletonText noOfLines={5} spacing={3} /></Box>
        ) : (
          <VStack align="stretch" spacing={0} divider={<Divider borderColor={C.border} />}>
            {categoryTotals.map(([cat, amount]) => {
              const color = CAT_COLORS[cat] ?? C.textMuted;
              const pct = amount > 0 ? (amount / maxAmount) * 100 : 0;
              return (
                <Box
                  key={cat} px={4} py={2.5}
                  _hover={{ bg: C.elevated }} transition="background 0.1s"
                >
                  <HStack justify="space-between" mb={1.5}>
                    <Text fontSize="sm" color={amount > 0 ? C.textSub : C.textMuted}>{prettifyCategory(cat)}</Text>
                    <Text fontSize="sm" fontFamily="mono" fontWeight={700} color={amount > 0 ? C.text : C.textMuted}>
                      {formatCurrency(amount, displayCurrency)}
                    </Text>
                  </HStack>
                  <Box h="4px" borderRadius="full" bg={C.active} overflow="hidden">
                    <Box
                      h="100%" w={`${pct}%`} bg={color}
                      borderRadius="full" transition="width 0.3s ease"
                    />
                  </Box>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>
    </Box>
  );
}

function DataRow({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <HStack
      justify="space-between"
      px={4}
      py={2.5}
      _hover={{ bg: C.elevated }}
      transition="background 0.1s"
    >
      <Box flex={1} minW={0}>{left}</Box>
      <Box flexShrink={0}>{right}</Box>
    </HStack>
  );
}
