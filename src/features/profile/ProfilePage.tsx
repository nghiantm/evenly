import {
  Box, VStack, HStack, Text, Input, Select, Button, Divider, Skeleton, useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { usersService } from '@/services/users';
import { FormField } from '@/components/forms/FormField';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SectionHeader } from '@/components/workspace/SectionHeader';
import { getErrorMessage } from '@/lib/apiClient';
import { SUPPORTED_CURRENCIES } from '@/lib/utils';
import { C } from '@/lib/colors';

const schema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100),
  defaultCurrency: z.string().min(3).max(3),
  avatarUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const qc = useQueryClient();
  const toast = useToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersService.getMe,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName,
        defaultCurrency: profile.defaultCurrency,
        avatarUrl: profile.avatarUrl ?? '',
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      usersService.updateMe({
        displayName: values.displayName,
        defaultCurrency: values.defaultCurrency,
        avatarUrl: values.avatarUrl || null,
      }),
    onSuccess: (updated) => {
      qc.setQueryData(['users', 'me'], updated);
      toast({ title: 'Profile updated', status: 'success', duration: 3000, isClosable: true });
    },
    onError: (err) => {
      toast({ title: 'Update failed', description: getErrorMessage(err), status: 'error', duration: 5000 });
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <Box>
      <SectionHeader eyebrow="Account" title="Profile" description="Manage your personal settings" />

      <Box px={5} py={5} maxW="640px">
        <VStack align="stretch" spacing={5}>
          {error && <ErrorAlert message={getErrorMessage(error)} />}

          {/* Identity card */}
          <Box border="1px solid" borderColor={C.border} borderRadius="lg" overflow="hidden" bg={C.surface}>
            <Box px={4} py={2.5} bg={C.elevated} borderBottom="1px solid" borderColor={C.border}>
              <Text fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700}>
                Identity
              </Text>
            </Box>
            <Box px={4} py={4}>
              {isLoading ? (
                <VStack spacing={3} align="stretch">
                  <Skeleton h={4} w="50%" borderRadius="sm" />
                  <Skeleton h={3} w="35%" borderRadius="sm" />
                </VStack>
              ) : profile ? (
                <VStack align="start" spacing={1}>
                  <Text fontWeight={700} fontSize="lg" color={C.text}>{profile.displayName}</Text>
                  <Text fontSize="sm" color={C.textMuted}>{profile.email}</Text>
                  {profile.emailVerified && (
                    <Text fontSize="10px" color={C.green} fontWeight={600} letterSpacing="0.05em">
                      VERIFIED
                    </Text>
                  )}
                </VStack>
              ) : null}
            </Box>
          </Box>

          {/* Edit form */}
          <Box border="1px solid" borderColor={C.border} borderRadius="lg" overflow="hidden" bg={C.surface}>
            <Box px={4} py={2.5} bg={C.elevated} borderBottom="1px solid" borderColor={C.border}>
              <Text fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700}>
                Edit Profile
              </Text>
            </Box>
            <Box px={4} py={4}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4} align="stretch">
                  <FormField label="Display Name" error={errors.displayName?.message}>
                    <Input {...register('displayName')} placeholder="Your name" />
                  </FormField>

                  <FormField label="Default Currency" error={errors.defaultCurrency?.message}>
                    <Select {...register('defaultCurrency')}>
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField
                    label="Avatar URL"
                    error={errors.avatarUrl?.message}
                    helperText="Link to your profile picture (optional)"
                  >
                    <Input {...register('avatarUrl')} placeholder="https://example.com/avatar.jpg" />
                  </FormField>

                  <Divider borderColor={C.border} />

                  <HStack justify="flex-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => reset()}
                      isDisabled={!isDirty || mutation.isPending}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      variant="terminal"
                      isLoading={mutation.isPending}
                      isDisabled={!isDirty}
                      loadingText="Saving…"
                    >
                      Save Changes
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </Box>
          </Box>

          {/* Account info */}
          {profile && (
            <Box border="1px solid" borderColor={C.border} borderRadius="lg" overflow="hidden" bg={C.surface}>
              <Box px={4} py={2.5} bg={C.elevated} borderBottom="1px solid" borderColor={C.border}>
                <Text fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700}>
                  Account Info
                </Text>
              </Box>
              <VStack align="stretch" spacing={0} divider={<Divider borderColor={C.border} />}>
                <HStack justify="space-between" px={4} py={3}>
                  <Text fontSize="xs" color={C.textMuted}>Email</Text>
                  <Text fontSize="sm" color={C.textSub}>{profile.email}</Text>
                </HStack>
                <HStack justify="space-between" px={4} py={3}>
                  <Text fontSize="xs" color={C.textMuted}>Status</Text>
                  <Text fontSize="sm" color={C.green} fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
                    {profile.status}
                  </Text>
                </HStack>
                <HStack justify="space-between" px={4} py={3}>
                  <Text fontSize="xs" color={C.textMuted}>User ID</Text>
                  <Text fontFamily="mono" fontSize="xs" color={C.textMuted}>{profile.userId}</Text>
                </HStack>
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
