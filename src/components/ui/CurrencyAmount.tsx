import { Text, type TextProps } from '@chakra-ui/react';
import { formatCurrency } from '@/lib/utils';

interface CurrencyAmountProps extends TextProps {
  amount: number;
  currency: string;
  /** If true, colour-code: positive = green, negative = red */
  colorCode?: boolean;
  /** Show explicit + sign for positive numbers */
  showSign?: boolean;
}

export function CurrencyAmount({
  amount,
  currency,
  colorCode = false,
  showSign = false,
  ...rest
}: CurrencyAmountProps) {
  const formatted = formatCurrency(Math.abs(amount), currency);
  const display = showSign && amount > 0 ? `+${formatted}` : amount < 0 ? `-${formatted}` : formatted;

  const color = colorCode
    ? amount > 0
      ? 'brand.600'
      : amount < 0
      ? 'red.500'
      : 'gray.500'
    : undefined;

  return (
    <Text as="span" color={color} {...rest}>
      {display}
    </Text>
  );
}
