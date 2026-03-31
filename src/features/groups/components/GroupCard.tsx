import {
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
  Badge,
  Box,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import type { Group } from '@/types';
import { RoleBadge } from '@/components/ui/RoleBadge';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card
      variant="outline"
      as={Link}
      to={`/groups/${group.groupId}`}
      _hover={{ shadow: 'md', borderColor: 'brand.300', transform: 'translateY(-1px)' }}
      transition="all 0.2s"
      cursor="pointer"
    >
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" align="start">
            <Box
              w={10}
              h={10}
              bg="brand.50"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Text fontSize="xl">👥</Text>
            </Box>
            <RoleBadge role={group.myRole} />
          </HStack>

          <VStack align="start" spacing={0.5}>
            <Text fontWeight="semibold" fontSize="md" color="gray.800" noOfLines={1}>
              {group.name}
            </Text>
            <Badge colorScheme="gray" fontSize="xs" variant="subtle">
              {group.defaultCurrency}
            </Badge>
          </VStack>

          <HStack spacing={4} fontSize="xs" color="gray.500">
            <Text>{group.memberCount} member{group.memberCount !== 1 ? 's' : ''}</Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
