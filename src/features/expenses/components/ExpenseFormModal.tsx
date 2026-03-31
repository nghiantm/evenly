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
  VStack,
  HStack,
  Text,
  NumberInput,
  NumberInputField,
  Checkbox,
  Divider,
  Alert,
  AlertIcon,
  Box,
  Badge,
  useToast,
  RadioGroup,
  Radio,
  Stack,
} from '@chakra-ui/react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { expensesService } from '@/services/expenses';
import { FormField } from '@/components/forms/FormField';
import { getErrorMessage } from '@/lib/apiClient';
import { SUPPORTED_CURRENCIES, round2, todayIso, formatCurrency } from '@/lib/utils';
import { C } from '@/lib/colors';
import type { GroupDetail, Expense, SplitType, CreateExpenseRequest } from '@/types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  description: z.string().min(1, 'Description is required').max(200),
  currency: z.string().min(3).max(3),
  totalAmount: z.coerce.number().positive('Must be positive'),
  expenseDate: z.string().min(1, 'Date is required'),
  note: z.string().max(500).optional(),
  paidByUserId: z.string().min(1, 'Select who paid'),
  splitType: z.enum(['EQUAL', 'EXACT', 'PERCENT', 'SHARE']),
  // Per-member fields — keyed by userId
  includedMembers: z.record(z.boolean()),   // for EQUAL
  exactAmounts: z.record(z.coerce.number()), // for EXACT
  percentages: z.record(z.coerce.number()),  // for PERCENT
  shares: z.record(z.coerce.number()),       // for SHARE
});

type FormValues = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupDetail;
  expense?: Expense; // if present, editing mode
}

export function ExpenseFormModal({ isOpen, onClose, group, expense }: ExpenseFormModalProps) {
  const qc = useQueryClient();
  const toast = useToast();
  const isEditing = !!expense;

  const defaultIncluded = useMemo(
    () => Object.fromEntries(group.members.map((m) => [m.userId, true])),
    [group.members]
  );
  const defaultExact = useMemo(
    () => Object.fromEntries(group.members.map((m) => [m.userId, 0])),
    [group.members]
  );
  const defaultPercent = useMemo(
    () => Object.fromEntries(group.members.map((m) => [m.userId, round2(100 / group.members.length)])),
    [group.members]
  );
  const defaultShares = useMemo(
    () => Object.fromEntries(group.members.map((m) => [m.userId, 1])),
    [group.members]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      currency: group.defaultCurrency,
      totalAmount: 0,
      expenseDate: todayIso(),
      note: '',
      paidByUserId: group.members[0]?.userId ?? '',
      splitType: 'EQUAL',
      includedMembers: defaultIncluded,
      exactAmounts: defaultExact,
      percentages: defaultPercent,
      shares: defaultShares,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (expense) {
      const included = Object.fromEntries(
        group.members.map((m) => [m.userId, expense.splits.some((s) => s.userId === m.userId)])
      );
      const exact = Object.fromEntries(
        group.members.map((m) => [m.userId, expense.splits.find((s) => s.userId === m.userId)?.amountOwed ?? 0])
      );
      reset({
        description: expense.description,
        currency: expense.currency,
        totalAmount: expense.totalAmount,
        expenseDate: expense.expenseDate,
        note: expense.note ?? '',
        paidByUserId: expense.paidBy[0]?.userId ?? group.members[0]?.userId,
        splitType: (expense.splits[0]?.splitType ?? 'EQUAL') as SplitType,
        includedMembers: included,
        exactAmounts: exact,
        percentages: defaultPercent,
        shares: defaultShares,
      });
    } else {
      reset({
        description: '',
        currency: group.defaultCurrency,
        totalAmount: 0,
        expenseDate: todayIso(),
        note: '',
        paidByUserId: group.members[0]?.userId ?? '',
        splitType: 'EQUAL',
        includedMembers: defaultIncluded,
        exactAmounts: defaultExact,
        percentages: defaultPercent,
        shares: defaultShares,
      });
    }
  }, [expense, isOpen]);

  const [previewRate, setPreviewRate] = useState<number | null>(null);

  const selectedCurrency = watch('currency');
  const isForeignCurrency = selectedCurrency !== group.defaultCurrency;

  useEffect(() => {
    if (!isForeignCurrency) { setPreviewRate(null); return; }
    setPreviewRate(null);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.frankfurter.app/latest?from=${selectedCurrency}&to=${group.defaultCurrency}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const json = await res.json();
        setPreviewRate(json.rates?.[group.defaultCurrency] ?? null);
      } catch {
        // aborted or network error — ignore
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [selectedCurrency, group.defaultCurrency, isForeignCurrency]);

  const splitType = watch('splitType') as SplitType;
  const totalAmount = watch('totalAmount');
  const includedMembers = watch('includedMembers');
  const exactAmounts = watch('exactAmounts');
  const percentages = watch('percentages');
  const shares = watch('shares');

  // Derived validation
  const includedIds = group.members.map((m) => m.userId).filter((id) => includedMembers?.[id]);
  const exactSum = includedIds.reduce((s, id) => s + (Number(exactAmounts?.[id]) || 0), 0);
  const percentSum = includedIds.reduce((s, id) => s + (Number(percentages?.[id]) || 0), 0);
  const totalShares = includedIds.reduce((s, id) => s + (Number(shares?.[id]) || 1), 0);

  const equalAmount = includedIds.length > 0 ? round2(totalAmount / includedIds.length) : 0;

  const exactError = splitType === 'EXACT'
    ? Math.abs(exactSum - totalAmount) > 0.01
      ? `Sum (${formatCurrency(exactSum, watch('currency'))}) must equal total (${formatCurrency(totalAmount, watch('currency'))})`
      : null
    : null;

  const percentError = splitType === 'PERCENT'
    ? Math.abs(percentSum - 100) > 0.01
      ? `Percentages must sum to 100% (currently ${percentSum.toFixed(1)}%)`
      : null
    : null;

  const mutation = useMutation({
    mutationFn: (body: CreateExpenseRequest) =>
      isEditing
        ? expensesService.update(group.groupId, expense!.expenseId, body)
        : expensesService.create(group.groupId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', group.groupId] });
      qc.invalidateQueries({ queryKey: ['balances', group.groupId] });
      toast({
        title: isEditing ? 'Expense updated' : 'Expense added',
        status: 'success',
        duration: 3000,
      });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err);
      const is503 = (err as { response?: { status?: number } })?.response?.status === 503;
      toast({
        title: is503 ? 'Exchange rate unavailable' : isEditing ? 'Update failed' : 'Failed to add expense',
        description: msg,
        status: is503 ? 'warning' : 'error',
        duration: is503 ? 8000 : 5000,
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (exactError || percentError || includedIds.length === 0) return;

    const currency = values.currency;
    let splits: CreateExpenseRequest['splits'] = [];

    if (values.splitType === 'EQUAL') {
      const perPerson = round2(values.totalAmount / includedIds.length);
      // Distribute remainder to first person
      const remainder = round2(values.totalAmount - perPerson * includedIds.length);
      splits = includedIds.map((id, i) => ({
        userId: id,
        amountOwed: i === 0 ? round2(perPerson + remainder) : perPerson,
        splitType: 'EQUAL',
      }));
    } else if (values.splitType === 'EXACT') {
      splits = includedIds.map((id) => ({
        userId: id,
        amountOwed: Number(values.exactAmounts[id]) || 0,
        splitType: 'EXACT',
      }));
    } else if (values.splitType === 'PERCENT') {
      splits = includedIds.map((id) => ({
        userId: id,
        amountOwed: round2((Number(values.percentages[id]) / 100) * values.totalAmount),
        splitType: 'PERCENT',
      }));
    } else {
      // SHARE
      splits = includedIds.map((id) => ({
        userId: id,
        amountOwed: round2((Number(values.shares[id]) / totalShares) * values.totalAmount),
        splitType: 'SHARE',
      }));
    }

    mutation.mutate({
      description: values.description,
      currency,
      totalAmount: values.totalAmount,
      expenseDate: values.expenseDate,
      note: values.note || undefined,
      paidBy: [{ userId: values.paidByUserId, amount: values.totalAmount }],
      splits,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEditing ? 'Edit Expense' : 'Add Expense'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={3} align="stretch">
              {/* Description */}
              <FormField label="Description" error={errors.description?.message} isRequired>
                <Input {...register('description')} placeholder="e.g. Groceries, Dinner, Rent" autoFocus />
              </FormField>

              {/* Amount + Currency */}
              <HStack>
                <FormField label="Amount" error={errors.totalAmount?.message} isRequired flex={2}>
                  <NumberInput min={0.01} precision={2}>
                    <NumberInputField {...register('totalAmount')} placeholder="0.00" />
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

              {/* FX preview */}
              {isForeignCurrency && (
                <Box px={1}>
                  {previewRate ? (
                    <Text fontSize="xs" color="blue.300" fontFamily="mono">
                      Preview: 1 {selectedCurrency} ≈ {previewRate} {group.defaultCurrency}
                      {totalAmount > 0 && ` · ≈ ${formatCurrency(round2(Number(totalAmount) * previewRate), group.defaultCurrency)}`}
                    </Text>
                  ) : (
                    <Text fontSize="xs" color={C.textMuted}>Fetching exchange rate…</Text>
                  )}
                  <Text fontSize="10px" color={C.textMuted} mt={0.5}>
                    Rate is indicative only — the backend locks the final rate on save.
                  </Text>
                </Box>
              )}

              {/* Date + Paid by */}
              <HStack align="flex-start">
                <FormField label="Date" error={errors.expenseDate?.message} isRequired flex={1}>
                  <Input type="date" {...register('expenseDate')} />
                </FormField>
                <FormField label="Paid By" error={errors.paidByUserId?.message} isRequired flex={1}>
                  <Select {...register('paidByUserId')}>
                    {group.members.map((m) => (
                      <option key={m.userId} value={m.userId}>{m.displayName}</option>
                    ))}
                  </Select>
                </FormField>
              </HStack>

              <Divider />

              {/* Split type */}
              <FormField label="Split Method">
                <Controller
                  control={control}
                  name="splitType"
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <Stack direction="row" wrap="wrap" spacing={3}>
                        {(['EQUAL', 'EXACT', 'PERCENT', 'SHARE'] as SplitType[]).map((t) => (
                          <Radio key={t} value={t} colorScheme="brand">
                            <Text fontSize="sm">{t.charAt(0) + t.slice(1).toLowerCase()}</Text>
                          </Radio>
                        ))}
                      </Stack>
                    </RadioGroup>
                  )}
                />
              </FormField>

              {/* Split details */}
              <SplitDetails
                splitType={splitType}
                members={group.members}
                totalAmount={Number(totalAmount) || 0}
                currency={watch('currency')}
                control={control}
                watch={watch}
                setValue={setValue}
                includedIds={includedIds}
                equalAmount={equalAmount}
                exactSum={exactSum}
                percentSum={percentSum}
                totalShares={totalShares}
              />

              {/* Validation errors */}
              {exactError && (
                <Alert status="warning" borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  {exactError}
                </Alert>
              )}
              {percentError && (
                <Alert status="warning" borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  {percentError}
                </Alert>
              )}
              {includedIds.length === 0 && splitType === 'EQUAL' && (
                <Alert status="warning" borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  Select at least one member.
                </Alert>
              )}

              {/* Note */}
              <FormField label="Note (optional)">
                <Textarea {...register('note')} placeholder="Optional note…" rows={2} />
              </FormField>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={onClose} isDisabled={mutation.isPending}>Cancel</Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={mutation.isPending}
              isDisabled={!!exactError || !!percentError || includedIds.length === 0}
              loadingText={isEditing ? 'Saving…' : 'Adding…'}
            >
              {isEditing ? 'Save Changes' : 'Add Expense'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

// ─── Split Detail sub-component ───────────────────────────────────────────────

interface SplitDetailsProps {
  splitType: SplitType;
  members: GroupDetail['members'];
  totalAmount: number;
  currency: string;
  control: ReturnType<typeof useForm<FormValues>>['control'];
  watch: ReturnType<typeof useForm<FormValues>>['watch'];
  setValue: ReturnType<typeof useForm<FormValues>>['setValue'];
  includedIds: string[];
  equalAmount: number;
  exactSum: number;
  percentSum: number;
  totalShares: number;
}

function SplitDetails({
  splitType,
  members,
  totalAmount,
  currency,
  control,
  watch,
  setValue,
  includedIds,
  equalAmount,
  totalShares,
}: SplitDetailsProps) {
  const exactAmounts = watch('exactAmounts');
  const percentages = watch('percentages');
  const sharesValues = watch('shares');
  const includedMembers = watch('includedMembers');

  if (splitType === 'EQUAL') {
    return (
      <VStack align="stretch" spacing={2}>
        <Text fontSize="xs" color="gray.500">Select who is included in this split:</Text>
        {members.map((m) => (
          <HStack key={m.userId} justify="space-between">
            <Controller
              control={control}
              name={`includedMembers.${m.userId}`}
              render={({ field }) => (
                <Checkbox
                  isChecked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  colorScheme="brand"
                >
                  <Text fontSize="sm">{m.displayName}</Text>
                </Checkbox>
              )}
            />
            {includedMembers?.[m.userId] && (
              <Text fontSize="sm" fontWeight="medium" color="brand.600">
                {formatCurrency(equalAmount, currency)}
              </Text>
            )}
          </HStack>
        ))}
      </VStack>
    );
  }

  if (splitType === 'EXACT') {
    return (
      <VStack align="stretch" spacing={2}>
        <Text fontSize="xs" color="gray.500">Enter the exact amount each person owes:</Text>
        {members.map((m) => (
          <HStack key={m.userId} justify="space-between">
            <Text fontSize="sm" flex={1}>{m.displayName}</Text>
            <NumberInput
              min={0}
              precision={2}
              maxW={32}
              value={exactAmounts?.[m.userId] ?? 0}
              onChange={(_, val) => setValue(`exactAmounts.${m.userId}`, isNaN(val) ? 0 : val)}
            >
              <NumberInputField placeholder="0.00" />
            </NumberInput>
          </HStack>
        ))}
      </VStack>
    );
  }

  if (splitType === 'PERCENT') {
    return (
      <VStack align="stretch" spacing={2}>
        <Text fontSize="xs" color="gray.500">Enter what percentage each person owes (must total 100%):</Text>
        {members.map((m) => (
          <HStack key={m.userId} justify="space-between">
            <Text fontSize="sm" flex={1}>{m.displayName}</Text>
            <HStack>
              <NumberInput
                min={0}
                max={100}
                precision={1}
                maxW={24}
                value={percentages?.[m.userId] ?? 0}
                onChange={(_, val) => setValue(`percentages.${m.userId}`, isNaN(val) ? 0 : val)}
              >
                <NumberInputField placeholder="0" />
              </NumberInput>
              <Text fontSize="sm" color="gray.500">%</Text>
            </HStack>
            <Text fontSize="xs" color="gray.400" minW={16} textAlign="right">
              ≈ {formatCurrency(round2(((Number(percentages?.[m.userId]) || 0) / 100) * totalAmount), currency)}
            </Text>
          </HStack>
        ))}
      </VStack>
    );
  }

  // SHARE
  return (
    <VStack align="stretch" spacing={2}>
      <Text fontSize="xs" color="gray.500">Assign shares to each person (split proportionally):</Text>
      {members.map((m) => {
        const myShares = Number(sharesValues?.[m.userId]) || 1;
        const shareAmount = totalShares > 0 ? round2((myShares / totalShares) * totalAmount) : 0;
        return (
          <HStack key={m.userId} justify="space-between">
            <Text fontSize="sm" flex={1}>{m.displayName}</Text>
            <HStack>
              <NumberInput
                min={0}
                maxW={20}
                value={sharesValues?.[m.userId] ?? 1}
                onChange={(_, val) => setValue(`shares.${m.userId}`, isNaN(val) ? 1 : val)}
              >
                <NumberInputField placeholder="1" />
              </NumberInput>
              <Badge colorScheme="gray" fontSize="xs">share{myShares !== 1 ? 's' : ''}</Badge>
            </HStack>
            <Text fontSize="xs" color="gray.400" minW={16} textAlign="right">
              {formatCurrency(shareAmount, currency)}
            </Text>
          </HStack>
        );
      })}
    </VStack>
  );
}
