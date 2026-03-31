import {
  VStack, HStack, Text, Button, Divider, Box,
  IconButton, Skeleton, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settlementsService } from '@/services/settlements';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getErrorMessage } from '@/lib/apiClient';
import { isAtLeastAdmin, formatCurrency, formatDate } from '@/lib/utils';
import { C } from '@/lib/colors';
import { CreateSettlementModal } from './CreateSettlementModal';
import type { GroupDetail, Settlement } from '@/types';

interface SettlementsTabProps {
  group: GroupDetail;
  currentUserId: string;
}

export function SettlementsTab({ group, currentUserId }: SettlementsTabProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingSettlement, setDeletingSettlement] = useState<Settlement | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['settlements', group.groupId],
    queryFn: () => settlementsService.list(group.groupId),
  });

  const deleteMutation = useMutation({
    mutationFn: (settlementId: string) => settlementsService.delete(group.groupId, settlementId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements', group.groupId] });
      qc.invalidateQueries({ queryKey: ['balances', group.groupId] });
      toast({ title: 'Settlement deleted', status: 'success', duration: 3000 });
      setDeletingSettlement(null);
    },
    onError: (err) => {
      toast({ title: 'Delete failed', description: getErrorMessage(err), status: 'error', duration: 5000 });
    },
  });

  const getMemberName = (userId: string) => {
    if (userId === currentUserId) return 'You';
    return group.members.find((m) => m.userId === userId)?.displayName ?? userId.slice(0, 8);
  };

  return (
    <>
      <VStack align="stretch" spacing={0}>
        {/* Bar */}
        <HStack justify="space-between" py={2} mb={2}>
          <Text fontSize="xs" color={C.textMuted} fontFamily="mono">
            {data ? `${data.total} settlement${data.total !== 1 ? 's' : ''}` : ''}
          </Text>
          {!group.archivedAt && (
            <Button
              leftIcon={<AddIcon boxSize={2.5} />}
              size="sm"
              variant="terminal"
              onClick={() => setCreateOpen(true)}
            >
              Record Payment
            </Button>
          )}
        </HStack>

        {error && <ErrorAlert message={getErrorMessage(error)} mb={3} />}

        <Box border="1px solid" borderColor={C.border} borderRadius="lg" overflow="hidden" bg={C.surface}>
          {/* Header row */}
          <HStack
            px={4} py={2}
            bg={C.elevated}
            borderBottom="1px solid"
            borderColor={C.border}
          >
            <Text flex={1} fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700}>Payment</Text>
            <Text w="80px" fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700} textAlign="center" display={{ base: 'none', sm: 'block' }}>Date</Text>
            <Text w="96px" fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700} textAlign="right">Amount</Text>
            <Box w="36px" />
          </HStack>

          {isLoading ? (
            <VStack spacing={0} divider={<Divider borderColor={C.border} />}>
              {[1, 2, 3].map((i) => (
                <Box key={i} px={4} py={3}>
                  <Skeleton h={4} w="60%" borderRadius="sm" />
                </Box>
              ))}
            </VStack>
          ) : !data?.settlements.length ? (
            <Box px={4} py={8} textAlign="center">
              <Text fontSize="sm" color={C.textMuted}>No settlements yet.</Text>
              {!group.archivedAt && (
                <Button mt={3} size="sm" variant="terminal"
                  leftIcon={<AddIcon boxSize={2.5} />}
                  onClick={() => setCreateOpen(true)}
                >
                  Record First Payment
                </Button>
              )}
            </Box>
          ) : (
            <VStack align="stretch" spacing={0} divider={<Divider borderColor={C.border} />}>
              {data.settlements.map((s) => {
                const canDelete = s.createdBy === currentUserId || isAtLeastAdmin(group.myRole);
                const fromName = getMemberName(s.fromUserId);
                const toName = getMemberName(s.toUserId);
                return (
                  <HStack key={s.settlementId} px={4} py={3} align="center">
                    {/* Payment description */}
                    <VStack align="start" spacing={0} flex={1} minW={0}>
                      <Text fontSize="sm" fontWeight={500} color={C.text} noOfLines={1}>
                        <Text as="span" color={s.fromUserId === currentUserId ? C.red : C.text}>{fromName}</Text>
                        <Text as="span" color={C.textMuted}> paid </Text>
                        <Text as="span" color={s.toUserId === currentUserId ? C.green : C.text}>{toName}</Text>
                      </Text>
                      {s.note && (
                        <Text fontSize="10px" color={C.textMuted} noOfLines={1}>{s.note}</Text>
                      )}
                    </VStack>

                    {/* Date */}
                    <Text
                      w="80px" textAlign="center"
                      fontSize="xs" fontFamily="mono" color={C.textMuted}
                      display={{ base: 'none', sm: 'block' }}
                    >
                      {formatDate(s.settlementDate)}
                    </Text>

                    {/* Amount */}
                    <Text w="96px" textAlign="right" fontSize="sm" fontFamily="mono" fontWeight={700} color={C.green}>
                      {formatCurrency(s.amount, s.currency)}
                    </Text>

                    {/* Delete */}
                    <Box w="36px" display="flex" justifyContent="center">
                      {canDelete && (
                        <IconButton
                          aria-label="Delete settlement"
                          icon={<DeleteIcon />}
                          size="xs"
                          variant="ghost"
                          color={C.textMuted}
                          _hover={{ color: C.red }}
                          onClick={() => setDeletingSettlement(s)}
                        />
                      )}
                    </Box>
                  </HStack>
                );
              })}
            </VStack>
          )}
        </Box>
      </VStack>

      <CreateSettlementModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        group={group}
        currentUserId={currentUserId}
      />

      <AlertDialog isOpen={!!deletingSettlement} leastDestructiveRef={cancelRef} onClose={() => setDeletingSettlement(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Settlement?</AlertDialogHeader>
            <AlertDialogBody>
              This will delete the settlement and reverse the balance adjustment.
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={cancelRef} onClick={() => setDeletingSettlement(null)} variant="ghost">Cancel</Button>
              <Button
                colorScheme="red"
                isLoading={deleteMutation.isPending}
                onClick={() => deletingSettlement && deleteMutation.mutate(deletingSettlement.settlementId)}
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
