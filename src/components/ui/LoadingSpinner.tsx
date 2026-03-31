import { Center, Spinner, type CenterProps } from '@chakra-ui/react';

interface LoadingSpinnerProps extends CenterProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingSpinner({ size = 'lg', ...rest }: LoadingSpinnerProps) {
  return (
    <Center py={12} {...rest}>
      <Spinner size={size} color="brand.500" thickness="4px" speed="0.65s" />
    </Center>
  );
}
