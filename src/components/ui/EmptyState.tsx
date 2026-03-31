import { VStack, Text, Icon, type StackProps } from '@chakra-ui/react';

interface EmptyStateProps extends StackProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, ...rest }: EmptyStateProps) {
  return (
    <VStack
      spacing={3}
      py={12}
      px={6}
      textAlign="center"
      color="gray.500"
      {...rest}
    >
      {icon && <Icon as={icon} boxSize={12} color="gray.300" />}
      <Text fontWeight="semibold" fontSize="lg" color="gray.600">
        {title}
      </Text>
      {description && (
        <Text fontSize="sm" maxW="xs">
          {description}
        </Text>
      )}
      {action}
    </VStack>
  );
}
