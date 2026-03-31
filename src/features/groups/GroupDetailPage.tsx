import {
  Box, HStack, Text, Tabs, TabList, TabPanels, Tab, TabPanel,
  Badge, Skeleton, VStack, Button, IconButton, useDisclosure,
} from '@chakra-ui/react';
import { ChevronLeftIcon, SettingsIcon } from '@chakra-ui/icons';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { groupsService } from '@/services/groups';
import { usersService } from '@/services/users';
import { expensesService } from '@/services/expenses';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SectionHeader } from '@/components/workspace/SectionHeader';
import { getErrorMessage } from '@/lib/apiClient';
import { isAtLeastAdmin } from '@/lib/utils';
import { EditGroupModal } from './components/EditGroupModal';
import { MembersTab } from './components/MembersTab';
import { ExpensesTab } from '../expenses/components/ExpensesTab';
import { BalancesTab } from '../balances/BalancesTab';
import { SettlementsTab } from '../settlements/components/SettlementsTab';
import { C } from '@/lib/colors';

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const editDisclosure = useDisclosure();

  const { data: me } = useQuery({ queryKey: ['users', 'me'], queryFn: usersService.getMe });

  const { data: expensesPage } = useQuery({
    queryKey: ['expenses', groupId, 1],
    queryFn: () => expensesService.list(groupId!, { page: 1, page_size: 1 }),
    enabled: !!groupId,
    staleTime: 60_000,
  });
  const hasExpenses = (expensesPage?.total ?? 0) > 0;

  const { data: group, isLoading, error } = useQuery({
    queryKey: ['groups', groupId],
    queryFn:  () => groupsService.getById(groupId!),
    enabled:  !!groupId,
    staleTime: 60_000,
  });

  if (!groupId) return <Navigate to="/groups" replace />;

  if (isLoading) {
    return (
      <Box>
        <Box px={5} py={3} borderBottom="1px solid" borderColor={C.border}>
          <Skeleton h={5} w="200px" borderRadius="sm" />
        </Box>
        <Box px={5} py={5}>
          <VStack align="stretch" spacing={3}>
            <Skeleton h={4} w="40%" borderRadius="sm" />
            <Skeleton h={64} borderRadius="lg" />
          </VStack>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box px={5} py={5}>
        <ErrorAlert message={getErrorMessage(error)} />
      </Box>
    );
  }

  if (!group) return null;

  const canEdit    = isAtLeastAdmin(group.myRole);
  const currentUserId = me?.userId ?? '';

  const tabBar = (
    <TabList
      borderBottom="1px solid"
      borderColor={C.border}
      px={5}
      overflowX="auto"
      overflowY="hidden"
      css={{ '::-webkit-scrollbar': { height: '2px' } }}
    >
      {['Expenses', 'Balances', 'Settlements', 'Members'].map(label => (
        <Tab key={label} whiteSpace="nowrap">{label}</Tab>
      ))}
    </TabList>
  );

  return (
    <>
      <Tabs variant="workspace" isLazy>
        <SectionHeader
          eyebrow={
            <Text
              as={Link}
              to="/groups"
              fontSize="10px"
              color={C.textMuted}
              letterSpacing="0.1em"
              textTransform="uppercase"
              fontWeight={700}
              _hover={{ color: C.green }}
            >
              ← Groups
            </Text>
          }
          title={group.name}
          description={
            `${group.memberCount} member${group.memberCount !== 1 ? 's' : ''} · ${group.defaultCurrency}` +
            (group.archivedAt ? ' · Archived' : '')
          }
          actions={
            <HStack spacing={2}>
              {group.archivedAt && (
                <Badge colorScheme="orange" fontSize="10px">Archived</Badge>
              )}
              <RoleBadge role={group.myRole} />
              {canEdit && !group.archivedAt && (
                <IconButton
                  aria-label="Edit group"
                  icon={<SettingsIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={editDisclosure.onOpen}
                />
              )}
            </HStack>
          }
          footer={tabBar}
          pb={0}
        />

        <TabPanels>
          <TabPanel>
            <Box px={5}>
              <ExpensesTab group={group} currentUserId={currentUserId} />
            </Box>
          </TabPanel>
          <TabPanel>
            <Box px={5}>
              <BalancesTab group={group} currentUserId={currentUserId} />
            </Box>
          </TabPanel>
          <TabPanel>
            <Box px={5}>
              <SettlementsTab group={group} currentUserId={currentUserId} />
            </Box>
          </TabPanel>
          <TabPanel>
            <Box px={5}>
              <MembersTab group={group} currentUserId={currentUserId} />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <EditGroupModal
        isOpen={editDisclosure.isOpen}
        onClose={editDisclosure.onClose}
        group={group}
        hasExpenses={hasExpenses}
      />
    </>
  );
}
