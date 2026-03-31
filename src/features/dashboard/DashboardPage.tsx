import {
  Box, VStack, HStack, Text, Grid, Skeleton, SkeletonText,
  Divider,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { balancesService } from '@/services/balances';
import { usersService } from '@/services/users';
import { SectionHeader } from '@/components/workspace/SectionHeader';
import { MetricCard } from '@/components/workspace/MetricCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getErrorMessage } from '@/lib/apiClient';
import { formatCurrency } from '@/lib/utils';
import { C } from '@/lib/colors';

export function DashboardPage() {
  const { user } = useUser();
  const { data: profile } = useQuery({ queryKey: ['users', 'me'], queryFn: usersService.getMe });
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
