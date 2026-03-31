import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
  Text,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { settlementsService } from '@/services/settlements';
import { balancesService } from '@/services/balances';
import { FormField } from '@/components/forms/FormField';
import { CurrencyAmount } from '@/components/ui/CurrencyAmount';
import { getErrorMessage } from '@/lib/apiClient';
import { SUPPORTED_CURRENCIES, todayIso } from '@/lib/utils';
import type { GroupDetail } from '@/types';

const schema = z.object({
  fromUserId: z.string().min(1, 'Select who is paying'),
  toUserId: z.string().min(1, 'Select who is receiving'),
  currency: z.string().min(3).max(3),
  amount: z.coerce.number().positive('Amount must be positive'),
  settlementDate: z.string().min(1, 'Date is required'),
  note: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupDetail;
  currentUserId: string;
}

export function CreateSettlementModal({
  isOpen,
  onClose,
  group,
  currentUserId,
}: CreateSettlementModalProps) {
  const qc = useQueryClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromUserId: currentUserId,
      toUserId: '',
      currency: group.defaultCurrency,
      amount: 0,
      settlementDate: todayIso(),
      note: '',
    },
  });

  // Load balances to pre-fill suggested amount
  const { data: balances } = useQuery({
    queryKey: ['balances', group.groupId, group.defaultCurrency],
    queryFn: () => balancesService.getGroupBalances(group.groupId),
  });

  const fromUserId = watch('fromUserId');
  const toUserId = watch('toUserId');

  // Auto-fill suggested amount from pairwise debts
  useEffect(() => {
    if (fromUserId && toUserId && balances) {
      const debt = balances.pairwiseDebts.find(
        (d) => d.fromUserId === fromUserId && d.toUserId === toUserId
      );
      if (debt) {
        setValue('amount', debt.amount);
        setValue('currency', debt.currency);
      }
    }
  }, [fromUserId, toUserId, balances, setValue]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      settlementsService.create(group.groupId, {
        fromUserId: values.fromUserId,
        toUserId: values.toUserId,
        currency: values.currency,
        amount: values.amount,
        settlementDate: values.settlementDate,
        note: values.note || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements', group.groupId] });
      qc.invalidateQueries({ queryKey: ['balances', group.groupId] });
      qc.invalidateQueries({ queryKey: ['balances', 'me'] });
      toast({ title: 'Payment recorded', status: 'success', duration: 3000 });
      handleClose();
    },
    onError: (err) => {
      toast({ title: 'Failed to record payment', description: getErrorMessage(err), status: 'error', duration: 5000 });
    },
  });

  const handleClose = () => {
    reset({
      fromUserId: currentUserId,
      toUserId: '',
      currency: group.defaultCurrency,
      amount: 0,
      settlementDate: todayIso(),
      note: '',
    });
    onClose();
  };

  const sameUser = fromUserId && toUserId && fromUserId === toUserId;

  // Show suggested debt if available
  const suggestedDebt = fromUserId && toUserId && balances
    ? balances.pairwiseDebts.find((d) => d.fromUserId === fromUserId && d.toUserId === toUserId)
    : null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Record Payment</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <ModalBody>
            <VStack spacing={4}>
              <FormField label="Who is paying?" error={errors.fromUserId?.message} isRequired>
                <Select {...register('fromUserId')}>
                  {group.members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.displayName}{m.userId === currentUserId ? ' (you)' : ''}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Who is receiving?" error={errors.toUserId?.message} isRequired>
                <Select {...register('toUserId')}>
                  <option value="">Select member…</option>
                  {group.members
                    .filter((m) => m.userId !== fromUserId)
                    .map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.displayName}{m.userId === currentUserId ? ' (you)' : ''}
                      </option>
                    ))}
                </Select>
              </FormField>

              {sameUser && (
                <Alert status="warning" borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  Payer and receiver cannot be the same person.
                </Alert>
              )}

              {suggestedDebt && (
                <Alert status="info" borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  Suggested: {fromUserId === currentUserId ? 'You owe' : `${group.members.find(m => m.userId === fromUserId)?.displayName} owes`}{' '}
                  <CurrencyAmount
                    amount={suggestedDebt.amount}
                    currency={suggestedDebt.currency}
                    fontWeight="semibold"
                    fontSize="sm"
                    ml={1}
                  />
                </Alert>
              )}

              <HStack>
                <FormField label="Amount" error={errors.amount?.message} isRequired flex={2}>
                  <NumberInput min={0.01} precision={2}>
                    <NumberInputField {...register('amount')} placeholder="0.00" />
                  </NumberInput>
                </FormField>
                <FormField label="Currency" flex={1}>
                  <Select {...register('currency')}>
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </FormField>
              </HStack>

              <FormField label="Date" error={errors.settlementDate?.message} isRequired>
                <Input type="date" {...register('settlementDate')} />
              </FormField>

              <FormField label="Note (optional)">
                <Textarea {...register('note')} placeholder="e.g. Venmo, Cash, Bank transfer…" rows={2} />
              </FormField>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={handleClose} isDisabled={mutation.isPending}>Cancel</Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={mutation.isPending}
              isDisabled={!!sameUser}
              loadingText="Recording…"
            >
              Record Payment
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
