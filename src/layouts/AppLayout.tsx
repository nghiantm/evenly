import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
  Divider,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/users';
import { TokenSync } from '@/features/auth/TokenSync';
import { getInitials } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: '📊' },
  { label: 'Groups', to: '/groups', icon: '👥' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <VStack align="stretch" spacing={0} h="full">
      {/* Logo */}
      <Link to="/dashboard" onClick={onClose}>
        <HStack spacing={3} px={5} py={5}>
          <Box
            w={8}
            h={8}
            bg="brand.500"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Text color="white" fontWeight="bold" fontSize="md">E</Text>
          </Box>
          <Text fontWeight="bold" fontSize="lg" color="gray.800">Evenly</Text>
        </HStack>
      </Link>

      <Divider />

      {/* Nav items */}
      <VStack align="stretch" spacing={1} px={3} py={4} flex={1}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={onClose}>
            {({ isActive }) => (
              <HStack
                spacing={3}
                px={3}
                py={2.5}
                borderRadius="lg"
                bg={isActive ? 'brand.50' : 'transparent'}
                color={isActive ? 'brand.700' : 'gray.600'}
                fontWeight={isActive ? 600 : 400}
                _hover={{ bg: isActive ? 'brand.50' : 'gray.100', color: isActive ? 'brand.700' : 'gray.800' }}
                transition="all 0.15s"
              >
                <Text fontSize="lg">{item.icon}</Text>
                <Text fontSize="sm">{item.label}</Text>
              </HStack>
            )}
          </NavLink>
        ))}
      </VStack>

      {/* Health indicator */}
      <HealthBadge />
    </VStack>
  );
}

function HealthBadge() {
  const { data } = useQuery({
    queryKey: ['health'],
    queryFn: usersService.getHealth,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  return (
    <Box px={5} py={4}>
      <HStack spacing={2}>
        <Box
          w={2}
          h={2}
          borderRadius="full"
          bg={data?.status === 'ok' ? 'brand.500' : 'red.400'}
        />
        <Text fontSize="xs" color="gray.400">
          API {data?.status === 'ok' ? 'healthy' : 'unavailable'}
        </Text>
      </HStack>
    </Box>
  );
}

export function AppLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { signOut } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: profile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersService.getMe,
    staleTime: 1000 * 60 * 5,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/sign-in');
    } catch {
      toast({ title: 'Sign out failed', status: 'error', duration: 3000 });
    }
  };

  const displayName = profile?.displayName || user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User';
  const avatarUrl = profile?.avatarUrl || user?.imageUrl;

  return (
    <>
      <TokenSync />
      <Flex h="100vh" overflow="hidden">
        {/* Desktop sidebar */}
        <Box
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
          w="220px"
          flexShrink={0}
          bg="white"
          borderRight="1px solid"
          borderColor="gray.200"
          h="100vh"
          overflowY="auto"
        >
          <SidebarContent />
        </Box>

        {/* Mobile drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody p={0}>
              <SidebarContent onClose={onClose} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main content */}
        <Flex direction="column" flex={1} overflow="hidden">
          {/* Topbar */}
          <HStack
            px={4}
            py={3}
            bg="white"
            borderBottom="1px solid"
            borderColor="gray.200"
            justify="space-between"
            flexShrink={0}
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              variant="ghost"
              onClick={onOpen}
            />
            <Box flex={1} />
            <Menu>
              <MenuButton>
                <Avatar
                  size="sm"
                  name={getInitials(displayName)}
                  src={avatarUrl ?? undefined}
                  bg="brand.500"
                  color="white"
                  cursor="pointer"
                />
              </MenuButton>
              <MenuList shadow="lg" borderColor="gray.200">
                <Box px={4} py={2}>
                  <Text fontWeight="semibold" fontSize="sm">{displayName}</Text>
                  <Text fontSize="xs" color="gray.500">{profile?.email || user?.primaryEmailAddress?.emailAddress}</Text>
                </Box>
                <MenuDivider />
                <MenuItem fontSize="sm" as={Link} to="/profile">
                  My Profile
                </MenuItem>
                <MenuDivider />
                <MenuItem fontSize="sm" color="red.500" onClick={handleSignOut}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          {/* Page content */}
          <Box flex={1} overflowY="auto" bg="gray.50">
            <Outlet />
          </Box>
        </Flex>
      </Flex>
    </>
  );
}
