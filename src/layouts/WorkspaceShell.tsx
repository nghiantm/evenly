import {
  Box, HStack, IconButton, Drawer, DrawerOverlay, DrawerContent,
  DrawerCloseButton, DrawerBody, useDisclosure, Avatar, Menu,
  MenuButton, MenuList, MenuItem, MenuDivider, Text, VStack,
  useToast,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { TokenSync } from '@/features/auth/TokenSync';
import { LeftNavRail } from './LeftNavRail';
import { RightContextPanel } from './RightContextPanel';
import { WorkspaceActionsContext } from './WorkspaceActionsContext';
import { CreateGroupModal } from '@/features/groups/components/CreateGroupModal';
import { ExpenseFormModal } from '@/features/expenses/components/ExpenseFormModal';
import { CreateSettlementModal } from '@/features/settlements/components/CreateSettlementModal';
import { groupsService } from '@/services/groups';
import { usersService } from '@/services/users';
import { C } from '@/lib/colors';
import { getInitials } from '@/lib/utils';

export function WorkspaceShell() {
  const navigate    = useNavigate();
  const toast       = useToast();
  const { signOut } = useClerk();
  const { user }    = useUser();

  const mobileMenuDisc = useDisclosure();
  const newGroupDisc   = useDisclosure();
  const newExpenseDisc = useDisclosure();
  const recordPayDisc  = useDisclosure();

  // Detect which group is currently open for context-aware quick actions
  const groupMatch   = useMatch('/groups/:groupId');
  const currentGroupId = groupMatch?.params?.groupId ?? null;

  const { data: profile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn:  usersService.getMe,
    staleTime: 5 * 60_000,
  });

  // Pre-fetch group for the quick-action modals (served from cache if center panel loaded it)
  const { data: currentGroup } = useQuery({
    queryKey: ['groups', currentGroupId],
    queryFn:  () => groupsService.getById(currentGroupId!),
    enabled:  !!currentGroupId,
    staleTime: 60_000,
  });

  const currentUserId = profile?.userId ?? '';
  const displayName   = user?.fullName || profile?.displayName || 'You';
  const avatarUrl     = profile?.avatarUrl || user?.imageUrl;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/sign-in');
    } catch {
      toast({ title: 'Sign out failed', status: 'error', duration: 3000 });
    }
  };

  return (
    <WorkspaceActionsContext.Provider value={{
      openNewGroup:      newGroupDisc.onOpen,
      openNewExpense:    newExpenseDisc.onOpen,
      openRecordPayment: recordPayDisc.onOpen,
      currentGroupId,
    }}>
      <TokenSync />

      <Box h="100vh" overflow="hidden" bg={C.canvas}>
      <Box
        h="100vh"
        overflow="hidden"
        display="flex"
        maxW="1600px"
        mx="auto"
        borderX="1px solid"
        borderColor={C.border}
      >
        {/* ── Desktop left rail ── */}
        <Box
          display={{ base: 'none', md: 'flex' }}
          flexDir="column"
          w="220px"
          flexShrink={0}
          bg={C.leftRail}
          borderRight="1px solid"
          borderColor={C.border}
          h="100vh"
          overflow="hidden"
        >
          <LeftNavRail />
        </Box>

        {/* ── Mobile drawer ── */}
        <Drawer
          isOpen={mobileMenuDisc.isOpen}
          placement="left"
          onClose={mobileMenuDisc.onClose}
          size="xs"
        >
          <DrawerOverlay bg="blackAlpha.800" />
          <DrawerContent
            bg={C.leftRail}
            borderRight="1px solid"
            borderColor={C.border}
          >
            <DrawerCloseButton color={C.textSub} />
            <DrawerBody p={0}>
              <LeftNavRail onClose={mobileMenuDisc.onClose} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* ── Main area (center + right) ── */}
        <Box flex={1} display="flex" flexDir="column" overflow="hidden">

          {/* Mobile top bar */}
          <HStack
            display={{ base: 'flex', md: 'none' }}
            px={3}
            py={2}
            borderBottom="1px solid"
            borderColor={C.border}
            bg={C.surface}
            justify="space-between"
            flexShrink={0}
          >
            <HStack spacing={2}>
              <IconButton
                aria-label="Menu"
                icon={<HamburgerIcon />}
                variant="ghost"
                size="sm"
                onClick={mobileMenuDisc.onOpen}
              />
              <HStack spacing={2}>
                <img src="/evenly-logo.svg" alt="Evenly" style={{ height: '22px', width: 'auto' }} />
                <Text fontWeight={800} fontSize="sm" color={C.text} letterSpacing="0.15em" fontFamily="'Montserrat', sans-serif">
                  EVENLY
                </Text>
              </HStack>
            </HStack>

            <UserMenu
              displayName={displayName}
              avatarUrl={avatarUrl ?? undefined}
              onSignOut={handleSignOut}
              onProfile={() => navigate('/profile')}
            />
          </HStack>

          {/* Center + Right row */}
          <Box flex={1} display="flex" overflow="hidden">
            {/* Center content */}
            <Box flex={1} overflowY="auto" minW={0}>
              <Outlet />
            </Box>

            {/* Right context panel */}
            <Box
              display={{ base: 'none', xl: 'flex' }}
              flexDir="column"
              w="260px"
              flexShrink={0}
              borderLeft="1px solid"
              borderColor={C.border}
              bg={C.canvas}
              overflowY="auto"
            >
              <RightContextPanel />
            </Box>
          </Box>
        </Box>
      </Box>
      </Box>

      {/* ── Global modals (managed here so LeftNavRail can trigger them) ── */}
      <CreateGroupModal
        isOpen={newGroupDisc.isOpen}
        onClose={newGroupDisc.onClose}
      />

      {currentGroup && (
        <ExpenseFormModal
          isOpen={newExpenseDisc.isOpen}
          onClose={newExpenseDisc.onClose}
          group={currentGroup}
        />
      )}

      {currentGroup && (
        <CreateSettlementModal
          isOpen={recordPayDisc.isOpen}
          onClose={recordPayDisc.onClose}
          group={currentGroup}
          currentUserId={currentUserId}
        />
      )}
    </WorkspaceActionsContext.Provider>
  );
}

// ─── Mobile user menu ─────────────────────────────────────────────────────────

function UserMenu({
  displayName, avatarUrl, onSignOut, onProfile,
}: {
  displayName: string;
  avatarUrl?: string;
  onSignOut: () => void;
  onProfile: () => void;
}) {
  return (
    <Menu>
      <MenuButton>
        <Avatar
          size="xs"
          name={getInitials(displayName)}
          src={avatarUrl}
          bg="brand.500"
          color="white"
          cursor="pointer"
        />
      </MenuButton>
      <MenuList>
        <MenuItem fontSize="sm" onClick={onProfile}>My Profile</MenuItem>
        <MenuDivider />
        <MenuItem fontSize="sm" color="#f85149" onClick={onSignOut}>Sign Out</MenuItem>
      </MenuList>
    </Menu>
  );
}
