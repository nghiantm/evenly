import {
  VStack, HStack, Text, Button, Divider, Box,
  Select, Skeleton, Grid, useToast,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { balancesService } from '@/services/balances';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getErrorMessage } from '@/lib/apiClient';
import { isAtLeastAdmin, formatCurrency, SUPPORTED_CURRENCIES } from '@/lib/utils';
import { C } from '@/lib/colors';
import type { GroupDetail } from '@/types';

interface BalancesTabProps {
  group: GroupDetail;
  currentUserId: string;
}

export function BalancesTab({ group, currentUserId }: BalancesTabProps) {
  const [currency, setCurrency] = useState(group.defaultCurrency);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['balances', group.groupId, currency],
    queryFn: () => balancesService.getGroupBalances(group.groupId, currency),
  });

  const recalcMutation = useMutation({
    mutationFn: () => balancesService.recalculate(group.groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['balances', group.groupId] });
      toast({ title: 'Balances recalculated', status: 'success', duration: 3000 });
    },
    onError: (err) => {
      toast({ title: 'Recalculate failed', description: getErrorMessage(err), status: 'error', duration: 5000 });
    },
  });

  const canRecalculate = isAtLeastAdmin(group.myRole);

  const getMemberName = (userId: string) => {
    if (userId === currentUserId) return 'You';
    return group.members.find((m) => m.userId === userId)?.displayName ?? userId.slice(0, 8);
  };

  return (
    <VStack align="stretch" spacing={4}>
      {/* Controls bar */}
      <HStack justify="space-between" py={2} mb={2}>
        <HStack spacing={2}>
          <Text fontSize="xs" color={C.textMuted} fontFamily="mono">Currency:</Text>
          <Select
            size="sm"
            w="auto"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </HStack>

        {canRecalculate && (
          <Button
            size="sm"
            leftIcon={<RepeatIcon />}
            variant="terminal"
            isLoading={recalcMutation.isPending}
            onClick={() => recalcMutation.mutate()}
          >
            Recalculate
          </Button>
        )}
      </HStack>

      {error && <ErrorAlert message={getErrorMessage(error)} mb={3} />}

      {isLoading ? (
        <VStack spacing={3}>
          {[1, 2, 3].map((i) => <Skeleton key={i} h={14} borderRadius="lg" />)}
        </VStack>
      ) : !data ? null : (
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={4}>
          {/* Net Balances */}
          <Box border="1px solid" borderColor={C.border} borderRadius="lg" overflow="hidden" bg={C.surface}>
            <Box px={4} py={2.5} bg={C.elevated} borderBottom="1px solid" borderColor={C.border}>
              <Text fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700}>
                Net Balances
              </Text>
            </Box>
            {data.userBalances.length === 0 ? (
              <Box px={4} py={8} textAlign="center">
                <Text fontSize="sm" color={C.textMuted}>All settled up!</Text>
              </Box>
            ) : (
              <VStack align="stretch" spacing={0} divider={<Divider borderColor={C.border} />}>
                {data.userBalances.map((ub) => {
                  const name = getMemberName(ub.userId);
                  return (
                    <HStack key={ub.userId} justify="space-between" px={4} py={3}>
                      <Text fontSize="sm" color={C.textSub} fontWeight={500}>{name}</Text>
                      <VStack align="end" spacing={0}>
                        <Text
                          fontSize="sm" fontFamily="mono" fontWeight={700}
                          color={ub.netAmount >= 0 ? C.green : C.red}
                        >
                          {ub.netAmount >= 0 ? '+' : ''}{formatCurrency(ub.netAmount, currency)}
                        </Text>
                        <Text fontSize="10px" color={C.textMuted}>
                          {ub.netAmount > 0 ? 'is owed' : ub.netAmount < 0 ? 'owes' : 'settled'}
                        </Text>
                      </VStack>
                    </HStack>
                  );
                })}
              </VStack>
            )}
          </Box>

          {/* Who Owes Whom */}
          <Box border="1px solid" borderColor={C.border} borderRadius="lg" overflow="hidden" bg={C.surface}>
            <Box px={4} py={2.5} bg={C.elevated} borderBottom="1px solid" borderColor={C.border}>
              <Text fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700}>
                Who Owes Whom
              </Text>
            </Box>
            {data.pairwiseDebts.length === 0 ? (
              <Box px={4} py={8} textAlign="center">
                <Text fontSize="sm" color={C.textMuted}>No outstanding debts!</Text>
              </Box>
            ) : (
              <VStack align="stretch" spacing={0} divider={<Divider borderColor={C.border} />}>
                {data.pairwiseDebts.map((debt, i) => {
                  const from = getMemberName(debt.fromUserId);
                  const to = getMemberName(debt.toUserId);
                  const isMyDebt = debt.fromUserId === currentUserId;
                  const isOwedToMe = debt.toUserId === currentUserId;
                  return (
                    <HStack key={i} justify="space-between" px={4} py={3}>
                      <Text fontSize="sm">
                        <Text as="span" fontWeight={600} color={isMyDebt ? C.red : C.text}>{from}</Text>
                        <Text as="span" color={C.textMuted}> owes </Text>
                        <Text as="span" fontWeight={600} color={isOwedToMe ? C.green : C.text}>{to}</Text>
                      </Text>
                      <Text
                        fontSize="sm" fontFamily="mono" fontWeight={700}
                        color={isMyDebt ? C.red : isOwedToMe ? C.green : C.textSub}
                      >
                        {formatCurrency(debt.amount, debt.currency)}
                      </Text>
                    </HStack>
                  );
                })}
              </VStack>
            )}
          </Box>
        </Grid>
      )}
    </VStack>
  );
}
