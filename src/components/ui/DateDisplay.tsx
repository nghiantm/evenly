import { Text, type TextProps } from '@chakra-ui/react';
import { formatDate, formatDateTime } from '@/lib/utils';

interface DateDisplayProps extends TextProps {
  dateStr: string;
  withTime?: boolean;
}

export function DateDisplay({ dateStr, withTime = false, ...rest }: DateDisplayProps) {
  const label = withTime ? formatDateTime(dateStr) : formatDate(dateStr);
  return <Text as="span" {...rest}>{label}</Text>;
}
