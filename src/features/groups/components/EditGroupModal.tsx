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
  Switch,
  VStack,
  HStack,
  Text,
  useToast,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { groupsService } from '@/services/groups';
import { FormField } from '@/components/forms/FormField';
import { getErrorMessage } from '@/lib/apiClient';
import { SUPPORTED_CURRENCIES, isOwner } from '@/lib/utils';
import type { GroupDetail } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
  defaultCurrency: z.string().min(3).max(3),
  simplifyDebts: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupDetail;
  hasExpenses?: boolean;
}

export function EditGroupModal({ isOpen, onClose, group, hasExpenses }: EditGroupModalProps) {
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const deleteDisclosure = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: group.name,
      defaultCurrency: group.defaultCurrency,
      simplifyDebts: group.simplifyDebts,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => groupsService.update(group.groupId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', group.groupId] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Group updated', status: 'success', duration: 3000 });
      onClose();
    },
    onError: (err) => {
      toast({ title: 'Update failed', description: getErrorMessage(err), status: 'error', duration: 5000 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => groupsService.delete(group.groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Group archived', status: 'success', duration: 3000 });
      navigate('/groups');
    },
    onError: (err) => {
      toast({ title: 'Archive failed', description: getErrorMessage(err), status: 'error', duration: 5000 });
    },
  });

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Group</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))}>
            <ModalBody>
              <VStack spacing={4}>
                <FormField label="Group Name" error={errors.name?.message} isRequired>
                  <Input {...register('name')} />
                </FormField>

                {!hasExpenses && (
                  <FormField label="Default Currency">
                    <Select {...register('defaultCurrency')}>
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </FormField>
                )}

                <FormField
                  label="Simplify Debts"
                  helperText="Minimise the number of transactions needed to settle up."
                >
                  <Switch {...register('simplifyDebts')} colorScheme="brand" />
                </FormField>

                {isOwner(group.myRole) && (
                  <>
                    <Divider />
                    <HStack w="full" justify="space-between" align="center">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" color="red.500">Archive Group</Text>
                        <Text fontSize="xs" color="gray.500">This will hide the group for all members.</Text>
                      </VStack>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={deleteDisclosure.onOpen}
                      >
                        Archive
                      </Button>
                    </HStack>
                  </>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter gap={2}>
              <Button variant="ghost" onClick={onClose} isDisabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={updateMutation.isPending}
                isDisabled={!isDirty}
                loadingText="Saving…"
              >
                Save Changes
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Archive confirmation */}
      <AlertDialog
        isOpen={deleteDisclosure.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteDisclosure.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Archive "{group.name}"?</AlertDialogHeader>
            <AlertDialogBody>
              Archiving the group will hide it from all members. This action can't be undone from the UI.
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={cancelRef} onClick={deleteDisclosure.onClose} variant="ghost">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => deleteMutation.mutate()}
                isLoading={deleteMutation.isPending}
              >
                Archive Group
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
