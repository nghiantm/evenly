import {
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Select,
  Box,
  Divider,
  useDisclosure,
  useToast,
  Avatar,
  Spinner,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { groupsService } from '@/services/groups';
import { usersService } from '@/services/users';
import { balancesService } from '@/services/balances';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { FormField } from '@/components/forms/FormField';
import { DateDisplay } from '@/components/ui/DateDisplay';
import { getErrorMessage } from '@/lib/apiClient';
import { isAtLeastAdmin, getInitials } from '@/lib/utils';
import type { GroupDetail, GroupMember, GroupRole, UserSearchResult } from '@/types';

interface MembersTabProps {
  group: GroupDetail;
  currentUserId: string;
}

export function MembersTab({ group, currentUserId }: MembersTabProps) {
  const addDisclosure = useDisclosure();
  const [removingMember, setRemovingMember] = useState<GroupMember | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const canManage = isAtLeastAdmin(group.myRole);

  const { data: balances } = useQuery({
    queryKey: ['balances', group.groupId],
    queryFn: () => balancesService.getGroupBalances(group.groupId),
    staleTime: 60_000,
  });

  const balanceByUser = Object.fromEntries(
    (balances?.userBalances ?? []).map(b => [b.userId, b.netAmount])
  );

  const removeMutation = useMutation({
    mutationFn: (userId: string) => groupsService.removeMember(group.groupId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', group.groupId] });
      toast({ title: 'Member removed', status: 'success', duration: 3000 });
      setRemovingMember(null);
    },
    onError: (err) => {
      toast({ title: 'Failed to remove member', description: getErrorMessage(err), status: 'error', duration: 5000 });
    },
  });

  return (
    <>
      <VStack align="stretch" spacing={0}>
        <HStack justify="space-between" mb={4}>
          <Text fontSize="sm" color="gray.500">
            {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
          </Text>
          {canManage && (
            <Button size="sm" leftIcon={<AddIcon />} colorScheme="brand" onClick={addDisclosure.onOpen}>
              Add Member
            </Button>
          )}
        </HStack>

        <VStack align="stretch" spacing={0} divider={<Divider />}>
          {group.members.map((member) => {
            const isMe = member.userId === currentUserId;
            const canRemove = canManage || isMe;
            return (
              <HStack key={member.userId} justify="space-between" py={3}>
                <HStack spacing={3}>
                  <UserAvatar
                    displayName={member.displayName}
                    avatarUrl={member.avatarUrl}
                    size="sm"
                  />
                  <VStack align="start" spacing={0}>
                    <HStack>
                      <Text fontSize="sm" fontWeight="medium">
                        {member.displayName}
                        {isMe && <Text as="span" color="gray.400" ml={1}>(you)</Text>}
                      </Text>
                      <RoleBadge role={member.role} />
                    </HStack>
                    <Text fontSize="xs" color="gray.500">{member.email}</Text>
                    <Text fontSize="xs" color="gray.400">
                      Joined <DateDisplay dateStr={member.joinedAt} fontSize="xs" color="gray.400" />
                    </Text>
                  </VStack>
                </HStack>

                {canRemove && group.myRole !== 'MEMBER' || isMe ? (
                  <Tooltip
                    label="Settle all balances before removing"
                    isDisabled={!balanceByUser[member.userId]}
                    hasArrow
                    placement="left"
                  >
                    <Box>
                      <IconButton
                        aria-label="Remove member"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => setRemovingMember(member)}
                        isDisabled={!canRemove || !!balanceByUser[member.userId]}
                      />
                    </Box>
                  </Tooltip>
                ) : null}
              </HStack>
            );
          })}
        </VStack>
      </VStack>

      <AddMemberModal
        isOpen={addDisclosure.isOpen}
        onClose={addDisclosure.onClose}
        groupId={group.groupId}
        existingMemberIds={group.members.map((m) => m.userId)}
      />

      {/* Remove confirmation */}
      <AlertDialog
        isOpen={!!removingMember}
        leastDestructiveRef={cancelRef}
        onClose={() => setRemovingMember(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              Remove {removingMember?.userId === currentUserId ? 'yourself' : removingMember?.displayName}?
            </AlertDialogHeader>
            <AlertDialogBody>
              {removingMember?.userId === currentUserId
                ? 'Are you sure you want to leave this group?'
                : `Remove ${removingMember?.displayName} from the group?`}
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={cancelRef} onClick={() => setRemovingMember(null)} variant="ghost">Cancel</Button>
              <Button
                colorScheme="red"
                isLoading={removeMutation.isPending}
                onClick={() => removingMember && removeMutation.mutate(removingMember.userId)}
              >
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

const addSchema = z.object({
  userId: z.string().min(1, 'Please select a user'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
});
type AddFormValues = z.infer<typeof addSchema>;

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  existingMemberIds: string[];
}

function AddMemberModal({ isOpen, onClose, groupId, existingMemberIds }: AddMemberModalProps) {
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const { data: searchResults, isFetching } = useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => usersService.search(query, 10),
    enabled: query.length >= 1,
    staleTime: 1000 * 30,
  });

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<AddFormValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { role: 'MEMBER' },
  });

  const mutation = useMutation({
    mutationFn: (values: AddFormValues) =>
      groupsService.addMember(groupId, { userId: values.userId, role: values.role as GroupRole }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId] });
      toast({ title: 'Member added', status: 'success', duration: 3000 });
      handleClose();
    },
    onError: (err) => {
      toast({ title: 'Failed to add member', description: getErrorMessage(err), status: 'error', duration: 5000 });
    },
  });

  const handleClose = () => {
    reset();
    setQuery('');
    setSelectedUser(null);
    onClose();
  };

  const filteredResults = searchResults?.filter((u) => !existingMemberIds.includes(u.userId)) ?? [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Member</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <ModalBody>
            <VStack spacing={4}>
              <FormField label="Search User" error={errors.userId?.message} isRequired>
                <VStack align="stretch" spacing={2}>
                  <Input
                    placeholder="Search by name or email…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedUser(null);
                      setValue('userId', '');
                    }}
                  />

                  {selectedUser ? (
                    <HStack
                      bg="brand.50"
                      px={3}
                      py={2}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="brand.200"
                    >
                      <Avatar
                        size="sm"
                        name={getInitials(selectedUser.displayName)}
                        src={selectedUser.avatarUrl ?? undefined}
                        bg="brand.500"
                        color="white"
                      />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="sm" fontWeight="medium">{selectedUser.displayName}</Text>
                        <Text fontSize="xs" color="gray.500">{selectedUser.email}</Text>
                      </VStack>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => { setSelectedUser(null); setValue('userId', ''); setQuery(''); }}
                      >
                        ×
                      </Button>
                    </HStack>
                  ) : query.length >= 1 ? (
                    <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" maxH={48} overflowY="auto">
                      {isFetching ? (
                        <HStack p={3} justify="center"><Spinner size="sm" color="brand.500" /></HStack>
                      ) : filteredResults.length === 0 ? (
                        <Text p={3} fontSize="sm" color="gray.500">No users found.</Text>
                      ) : (
                        filteredResults.map((u) => (
                          <HStack
                            key={u.userId}
                            px={3}
                            py={2}
                            cursor="pointer"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => {
                              setSelectedUser(u);
                              setValue('userId', u.userId);
                              setQuery(u.displayName);
                            }}
                          >
                            <Avatar
                              size="xs"
                              name={getInitials(u.displayName)}
                              src={u.avatarUrl ?? undefined}
                              bg="brand.500"
                              color="white"
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">{u.displayName}</Text>
                              <Text fontSize="xs" color="gray.500">{u.email}</Text>
                            </VStack>
                          </HStack>
                        ))
                      )}
                    </Box>
                  ) : null}
                </VStack>
              </FormField>

              <FormField label="Role">
                <Select {...register('role')}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="OWNER">Owner</option>
                </Select>
              </FormField>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={handleClose} isDisabled={mutation.isPending}>Cancel</Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={mutation.isPending}
              isDisabled={!selectedUser}
              loadingText="Adding…"
            >
              Add Member
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
