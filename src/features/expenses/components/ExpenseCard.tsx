import {
  Box, HStack, VStack, Text, Menu, MenuButton, MenuList, MenuItem,
  IconButton, Button, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesService } from '@/services/expenses';
import { getErrorMessage } from '@/lib/apiClient';
import { isAtLeastAdmin, formatCurrency, formatDate } from '@/lib/utils';
import { C } from '@/lib/colors';
import type { Expense, GroupMember, GroupRole } from '@/types';

interface ExpenseCardProps {
  expense: Expense;
  members: GroupMember[];
  currentUserId: string;
  groupRole: GroupRole;
  onClick: () => void;
  onEdit: () => void;
}

export function ExpenseCard({
  expense,
  members,
  currentUserId,
  groupRole,
  onClick,
  onEdit,
}: ExpenseCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const canEdit = expense.createdBy === currentUserId || isAtLeastAdmin(groupRole);

  const paidByName = (() => {
    if (!expense.paidBy.length) return 'Unknown';
    if (expense.paidBy.length === 1) {
      const m = members.find((m) => m.userId === expense.paidBy[0].userId);
      const name = m?.displayName ?? expense.paidBy[0].userId.slice(0, 8);
      return expense.paidBy[0].userId === currentUserId ? 'You' : name;
    }
    return `${expense.paidBy.length} people`;
  })();

  const myOwed = expense.splits.find((s) => s.userId === currentUserId)?.amountOwed ?? 0;
  const iPaid  = expense.paidBy.find((p) => p.userId === currentUserId)?.amount ?? 0;
  const myNet  = iPaid - myOwed;

  const deleteMutation = useMutation({
    mutationFn: () => expensesService.delete(expense.groupId, expense.expenseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', expense.groupId] });
      toast({ title: 'Expense deleted', status: 'success', duration: 3000 });
    },
    onError: (err) => {
      toast({ title: 'Failed to delete', description: getErrorMessage(err), status: 'error', duration: 5000 });
    },
  });

  return (
    <>
      <HStack
        px={4} py={3}
        _hover={{ bg: C.elevated }}
        transition="background 0.1s"
        cursor="pointer"
        onClick={onClick}
        align="center"
        role="button"
      >
        {/* Description */}
        <VStack align="start" spacing={0} flex={1} minW={0}>
          <Text fontSize="sm" fontWeight={500} color={C.text} noOfLines={1}>
            {expense.description}
          </Text>
          <Text fontSize="10px" color={C.textMuted} fontFamily="mono">
            {paidByName} paid
          </Text>
        </VStack>

        {/* Date */}
        <Text
          w="80px" textAlign="center"
          fontSize="xs" fontFamily="mono" color={C.textMuted}
          display={{ base: 'none', sm: 'block' }}
        >
          {formatDate(expense.expenseDate)}
        </Text>

        {/* Paid by (abbreviated) */}
        <Text
          w="64px" textAlign="center"
          fontSize="xs" color={C.textSub}
          noOfLines={1}
          display={{ base: 'none', md: 'block' }}
        >
          {paidByName}
        </Text>

        {/* Amount */}
        <VStack align="end" spacing={0} w="96px">
          <Text fontSize="sm" fontFamily="mono" fontWeight={700} color={C.text}>
            {formatCurrency(expense.totalAmount, expense.currency)}
          </Text>
          {myNet !== 0 && (
            <Text
              fontSize="10px" fontFamily="mono"
              color={myNet > 0 ? C.green : C.red}
            >
              {myNet > 0 ? '+' : ''}{formatCurrency(myNet, expense.currency)}
            </Text>
          )}
        </VStack>

        {/* Actions */}
        <Box w="28px" display="flex" justifyContent="center" onClick={(e) => e.stopPropagation()}>
          {canEdit && (
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Actions"
                icon={<ChevronDownIcon />}
                variant="ghost"
                size="xs"
                color={C.textMuted}
              />
              <MenuList fontSize="sm">
                <MenuItem icon={<EditIcon />} onClick={onEdit}>Edit</MenuItem>
                <MenuItem icon={<DeleteIcon />} color={C.red} onClick={() => setShowDeleteDialog(true)}>
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Box>
      </HStack>

      <AlertDialog isOpen={showDeleteDialog} leastDestructiveRef={cancelRef} onClose={() => setShowDeleteDialog(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete "{expense.description}"?</AlertDialogHeader>
            <AlertDialogBody>
              This will soft-delete the expense and adjust all balances.
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={cancelRef} onClick={() => setShowDeleteDialog(false)} variant="ghost">Cancel</Button>
              <Button
                colorScheme="red"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
