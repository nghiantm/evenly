import {
  Box, VStack, HStack, Text, Skeleton, Divider,
  Button, Input, InputGroup, InputLeftElement, useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, SearchIcon } from '@chakra-ui/icons';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { groupsService } from '@/services/groups';
import { CreateGroupModal } from './components/CreateGroupModal';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SectionHeader } from '@/components/workspace/SectionHeader';
import { getErrorMessage } from '@/lib/apiClient';
import { formatDate } from '@/lib/utils';
import { C } from '@/lib/colors';

export function GroupsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn:  groupsService.list,
    staleTime: 60_000,
  });

  const activeGroups = useMemo(
    () => (data ?? []).filter(g => !g.archivedAt),
    [data],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return activeGroups;
    const q = search.toLowerCase();
    return activeGroups.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.defaultCurrency.toLowerCase().includes(q)
    );
  }, [activeGroups, search]);

  return (
    <Box>
      <SectionHeader
        eyebrow="Workspace"
        title="Groups"
        description={`${activeGroups.length} active group${activeGroups.length !== 1 ? 's' : ''}`}
        actions={
          <Button
            leftIcon={<AddIcon boxSize={2.5} />}
            size="sm"
            variant="terminal"
            onClick={onOpen}
          >
            New Group
          </Button>
        }
      />

      <Box px={5} py={4}>
        <VStack align="stretch" spacing={4}>
          {error && <ErrorAlert message={getErrorMessage(error)} />}

          {/* Search */}
          <InputGroup size="sm" maxW="320px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={C.textMuted} boxSize={3} />
            </InputLeftElement>
            <Input
              placeholder="Filter groups…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              borderRadius="md"
            />
          </InputGroup>

          {/* List */}
          <Box
            border="1px solid"
            borderColor={C.border}
            borderRadius="lg"
            overflow="hidden"
            bg={C.surface}
          >
            {/* Table head */}
            <HStack
              px={4} py={2}
              bg={C.elevated}
              borderBottom="1px solid"
              borderColor={C.border}
            >
              <Text flex={1} fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700}>
                Group
              </Text>
              <Text w="80px" fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700} textAlign="center">
                Currency
              </Text>
              <Text w="72px" fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700} textAlign="center">
                Members
              </Text>
              <Text w="72px" fontSize="10px" color={C.textMuted} letterSpacing="0.1em" textTransform="uppercase" fontWeight={700} textAlign="right">
                Role
              </Text>
            </HStack>

            {isLoading ? (
              <VStack align="stretch" spacing={0} divider={<Divider borderColor={C.border} />}>
                {[1, 2, 3, 4].map(i => (
                  <Box key={i} px={4} py={3}>
                    <Skeleton h={4} w="60%" borderRadius="sm" />
                  </Box>
                ))}
              </VStack>
            ) : filtered.length === 0 ? (
              <Box px={4} py={8} textAlign="center">
                <Text fontSize="sm" color={C.textMuted}>
                  {search ? 'No groups match your filter.' : 'No groups yet — create one to get started.'}
                </Text>
                {!search && (
                  <Button
                    mt={3} size="sm" variant="terminal"
                    leftIcon={<AddIcon boxSize={2.5} />}
                    onClick={onOpen}
                  >
                    Create First Group
                  </Button>
                )}
              </Box>
            ) : (
              <VStack align="stretch" spacing={0} divider={<Divider borderColor={C.border} />}>
                {filtered.map(group => (
                  <HStack
                    key={group.groupId}
                    px={4}
                    py={3}
                    _hover={{ bg: C.elevated }}
                    transition="background 0.12s"
                    cursor="pointer"
                    as={Link}
                    to={`/groups/${group.groupId}`}
                    align="center"
                  >
                    {/* Name + meta */}
                    <VStack align="start" spacing={0} flex={1} minW={0}>
                      <Text fontSize="sm" fontWeight={600} color={C.text} noOfLines={1}>
                        {group.name}
                      </Text>
                      <Text fontSize="10px" color={C.textMuted}>
                        Updated {formatDate(group.updatedAt)}
                      </Text>
                    </VStack>

                    {/* Currency */}
                    <Text
                      w="80px" textAlign="center"
                      fontSize="xs" fontFamily="mono" fontWeight={600}
                      color={C.textSub}
                    >
                      {group.defaultCurrency}
                    </Text>

                    {/* Members */}
                    <Text
                      w="72px" textAlign="center"
                      fontSize="xs" fontFamily="mono"
                      color={C.textSub}
                    >
                      {group.memberCount}
                    </Text>

                    {/* Role */}
                    <Box w="72px" display="flex" justifyContent="flex-end">
                      <RoleBadge role={group.myRole} />
                    </Box>
                  </HStack>
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </Box>

      <CreateGroupModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}
