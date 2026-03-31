import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  type AlertProps,
} from '@chakra-ui/react';

interface ErrorAlertProps extends Omit<AlertProps, 'status'> {
  title?: string;
  message: string;
}

export function ErrorAlert({ title = 'Error', message, ...rest }: ErrorAlertProps) {
  return (
    <Alert status="error" borderRadius="lg" {...rest}>
      <AlertIcon />
      <Box>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription fontSize="sm">{message}</AlertDescription>
      </Box>
    </Alert>
  );
}
