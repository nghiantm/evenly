import {
  VStack, HStack, Text, Button, Box, Skeleton, Divider,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { expensesService } from '@/services/expenses';
import { ExpenseCard } from './ExpenseCard';
import { ExpenseFormModal } from './ExpenseFormModal';
import { ExpenseDetailModal } from './ExpenseDetail';
import { CreateSettlementModal } from '@/features/settlements/components/CreateSettlementModal';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getErrorMessage } from '@/lib/apiClient';
import { C } from '@/lib/colors';
import type { GroupDetail, Expense } from '@/types';

interface ExpensesTabProps {
  group: GroupDetail;
  currentUserId: string;
}

export function ExpensesTab({ group, currentUserId }: ExpensesTabProps) {
  const [page, setPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense]   = useState<Expense | null>(null);
  const [createOpen, setCreateOpen]           = useState(false);
  const [editOpen, setEditOpen]               = useState(false);
  const [detailOpen, setDetailOpen]           = useState(false);
  const [paymentOpen, setPaymentOpen]         = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', group.groupId, page],
    queryFn:  () => expensesService.list(group.groupId, { page, page_size: 20 }),
    staleTime: 30_000,
  });

  const handleView = (e: Expense)  => { setSelectedExpense(e); setDetailOpen(true); };
  const handleEdit = (e: Expense)  => { setEditingExpense(e);  setEditOpen(true);   };

  return (
    <>
      <VStack align="stretch" spacing={0}>
        {/* Bar */}
        <HStack justify="space-between" py={2} mb={2}>
          <Text fontSize="xs" color={C.textMuted} fontFamily="mono">
            {data ? `${data.total} expense${data.total !== 1 ? 's' : ''}` : ''}
          </Text>
          {!group.archivedAt && (
            <HStack spacing={2}>
              <Button
                leftIcon={<AddIcon boxSize={2.5} />}
                size="sm"
                variant="terminal"
                color={C.red}
                borderColor={C.red}
                _hover={{ bg: C.redDim }}
                onClick={() => setCreateOpen(true)}
              >
                Add Expense
              </Button>
              <Button
                size="sm"
                variant="terminal"
                color={C.green}
                borderColor={C.green}
                _hover={{ bg: C.greenDim }}
                onClick={() => setPaymentOpen(true)}
              >
                Record Payment
              </Button>
            </HStack>
          )}
        </HStack>

        {error && <ErrorAlert message={getErrorMessage(error)} mb={3} />}

        {/* List */}
        <Box border="1px solid" borderColor={C.border} borderRadius="lg" overflow="hidden" bg={C.surface}>
          {/* Header row */}
          <HStack
            px={4} py={2}
            bg={C.elevated}
            borderBottom="1px solid"
            borderColor={C.border}
          >
            <Text flex={1} fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700}>Description</Text>
            <Text w="80px" fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700} textAlign="center" display={{ base: 'none', sm: 'block' }}>Date</Text>
            <Text w="64px" fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700} textAlign="center" display={{ base: 'none', md: 'block' }}>Paid by</Text>
            <Text w="96px" fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700} textAlign="right">Amount</Text>
            <Box w="28px" />
          </HStack>

          {isLoading ? (
            <VStack spacing={0} divider={<Divider borderColor={C.border} />}>
              {[1,2,3,4].map(i => (
                <Box key={i} px={4} py={3}>
                  <Skeleton h={4} w="55%" borderRadius="sm" />
                </Box>
              ))}
            </VStack>
          ) : !data?.expenses.length ? (
            <Box px={4} py={8} textAlign="center">
              <Text fontSize="sm" color={C.textMuted}>No expenses yet.</Text>
              {!group.archivedAt && (
                <Button mt={3} size="sm" variant="terminal"
                  leftIcon={<AddIcon boxSize={2.5} />}
                  onClick={() => setCreateOpen(true)}
                >
                  Add First Expense
                </Button>
              )}
            </Box>
          ) : (
            <VStack align="stretch" spacing={0} divider={<Divider borderColor={C.border} />}>
              {data.expenses.map(expense => (
                <ExpenseCard
                  key={expense.expenseId}
                  expense={expense}
                  members={group.members}
                  currentUserId={currentUserId}
                  groupRole={group.myRole}
                  onClick={() => handleView(expense)}
                  onEdit={() => handleEdit(expense)}
                />
              ))}
            </VStack>
          )}
        </Box>

        {/* Pagination */}
        {(data?.totalPages ?? 0) > 1 && (
          <HStack justify="space-between" pt={3}>
            <Button
              size="sm" variant="terminal"
              isDisabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Previous
            </Button>
            <Text fontSize="xs" color={C.textMuted} fontFamily="mono">
              {page} / {data!.totalPages}
            </Text>
            <Button
              size="sm" variant="terminal"
              isDisabled={page === data?.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next →
            </Button>
          </HStack>
        )}
      </VStack>

      <ExpenseFormModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        group={group}
      />
      <ExpenseFormModal
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setEditingExpense(null); }}
        group={group}
        expense={editingExpense ?? undefined}
      />
      {selectedExpense && (
        <ExpenseDetailModal
          isOpen={detailOpen}
          onClose={() => { setDetailOpen(false); setSelectedExpense(null); }}
          expense={selectedExpense}
          group={group}
          currentUserId={currentUserId}
          onEdit={() => { setDetailOpen(false); handleEdit(selectedExpense); }}
        />
      )}
      <CreateSettlementModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        group={group}
        currentUserId={currentUserId}
      />
    </>
  );
}
