import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Divider,
  Button,
  Badge,
} from '@chakra-ui/react';
import { CurrencyAmount } from '@/components/ui/CurrencyAmount';
import { DateDisplay } from '@/components/ui/DateDisplay';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { isAtLeastAdmin } from '@/lib/utils';
import type { Expense, GroupDetail } from '@/types';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  group: GroupDetail;
  currentUserId: string;
  onEdit: () => void;
}

export function ExpenseDetailModal({
  isOpen,
  onClose,
  expense,
  group,
  currentUserId,
  onEdit,
}: ExpenseDetailModalProps) {
  const canEdit =
    expense.createdBy === currentUserId || isAtLeastAdmin(group.myRole);

  const getMember = (userId: string) => group.members.find((m) => m.userId === userId);

  const getMemberName = (userId: string) => {
    if (userId === currentUserId) return 'You';
    return getMember(userId)?.displayName ?? userId.slice(0, 8);
  };

  const getMemberAvatar = (userId: string) => getMember(userId)?.avatarUrl;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pb={2}>{expense.description}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {/* Amount + Date */}
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">Total</Text>
                <CurrencyAmount
                  amount={expense.totalAmount}
                  currency={expense.currency}
                  fontSize="2xl"
                  fontWeight="bold"
                />
              </VStack>
              <VStack align="end" spacing={0}>
                <Text fontSize="xs" color="gray.500">Date</Text>
                <DateDisplay dateStr={expense.expenseDate} fontWeight="medium" fontSize="sm" />
              </VStack>
            </HStack>

            {expense.category && (
              <Badge colorScheme="blue" alignSelf="start" textTransform="capitalize">
                {expense.category}
              </Badge>
            )}

            {expense.note && (
              <Text fontSize="sm" color="gray.600" bg="gray.50" p={3} borderRadius="md">
                {expense.note}
              </Text>
            )}

            <Divider />

            {/* Paid by */}
            <VStack align="stretch" spacing={2}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                Paid By
              </Text>
              {expense.paidBy.map((p) => (
                <HStack key={p.userId} justify="space-between">
                  <HStack>
                    <UserAvatar
                      displayName={getMemberName(p.userId)}
                      avatarUrl={getMemberAvatar(p.userId)}
                      size="xs"
                    />
                    <Text fontSize="sm">{getMemberName(p.userId)}</Text>
                  </HStack>
                  <CurrencyAmount amount={p.amount} currency={expense.currency} fontWeight="medium" fontSize="sm" />
                </HStack>
              ))}
            </VStack>

            <Divider />

            {/* Splits */}
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                  Split
                </Text>
                <Badge colorScheme="gray" fontSize="xs">
                  {expense.splits[0]?.splitType ?? 'EQUAL'}
                </Badge>
              </HStack>
              {expense.splits.map((s) => (
                <HStack key={s.userId} justify="space-between">
                  <HStack>
                    <UserAvatar displayName={getMemberName(s.userId)} avatarUrl={getMemberAvatar(s.userId)} size="xs" />
                    <Text fontSize="sm">{getMemberName(s.userId)}</Text>
                  </HStack>
                  <CurrencyAmount amount={s.amountOwed} currency={expense.currency} fontSize="sm" />
                </HStack>
              ))}
            </VStack>

            <Divider />

            <HStack justify="space-between" fontSize="xs" color="gray.400">
              <Text>
                Added by {getMemberName(expense.createdBy)}
              </Text>
              <DateDisplay dateStr={expense.createdAt} withTime fontSize="xs" color="gray.400" />
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          {canEdit && (
            <Button colorScheme="brand" variant="outline" onClick={onEdit}>
              Edit Expense
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
