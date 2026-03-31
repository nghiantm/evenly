import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  type FormControlProps,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface FormFieldProps extends FormControlProps {
  label?: string;
  error?: string;
  helperText?: string;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  helperText,
  children,
  ...rest
}: FormFieldProps) {
  return (
    <FormControl isInvalid={!!error} {...rest}>
      {label && <FormLabel mb={1} fontSize="sm" fontWeight="medium">{label}</FormLabel>}
      {children}
      {error ? (
        <FormErrorMessage fontSize="xs">{error}</FormErrorMessage>
      ) : helperText ? (
        <FormHelperText fontSize="xs">{helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
}
