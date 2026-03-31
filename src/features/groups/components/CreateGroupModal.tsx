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
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { groupsService } from '@/services/groups';
import { FormField } from '@/components/forms/FormField';
import { getErrorMessage } from '@/lib/apiClient';
import { SUPPORTED_CURRENCIES } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
  defaultCurrency: z.string().min(3).max(3),
});

type FormValues = z.infer<typeof schema>;

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { defaultCurrency: 'USD' },
  });

  const mutation = useMutation({
    mutationFn: groupsService.create,
    onSuccess: (group) => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: `"${group.name}" created`, status: 'success', duration: 3000 });
      reset();
      onClose();
      navigate(`/groups/${group.groupId}`);
    },
    onError: (err) => {
      toast({ title: 'Failed to create group', description: getErrorMessage(err), status: 'error', duration: 5000 });
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a New Group</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <ModalBody>
            <VStack spacing={4}>
              <FormField label="Group Name" error={errors.name?.message} isRequired>
                <Input {...register('name')} placeholder="e.g. Apartment, Road Trip" autoFocus />
              </FormField>

              <FormField label="Default Currency" error={errors.defaultCurrency?.message}>
                <Select {...register('defaultCurrency')}>
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </FormField>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={handleClose} isDisabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={mutation.isPending} loadingText="Creating…">
              Create Group
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
