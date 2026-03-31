import { HStack, Icon, Text } from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@chakra-ui/icons';
import { formatCurrency } from '@/lib/utils';

interface BalanceIndicatorProps {
  amount: number;
  currency: string;
  /** Short label like "you owe" or "you are owed" */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { text: 'sm' as const, icon: 3 },
  md: { text: 'md' as const, icon: 4 },
  lg: { text: 'xl' as const, icon: 5 },
};

export function BalanceIndicator({
  amount,
  currency,
  label,
  size = 'md',
}: BalanceIndicatorProps) {
  const { text, icon } = SIZES[size];
  const isPositive = amount > 0;
  const isNegative = amount < 0;
  const color = isPositive ? 'brand.600' : isNegative ? 'red.500' : 'gray.500';

  return (
    <HStack spacing={1}>
      <Icon
        as={isPositive ? ArrowUpIcon : isNegative ? ArrowDownIcon : MinusIcon}
        color={color}
        boxSize={icon}
      />
      <Text fontSize={text} fontWeight="semibold" color={color}>
        {label && <Text as="span" fontWeight="normal" color="gray.500" mr={1}>{label}</Text>}
        {formatCurrency(Math.abs(amount), currency)}
      </Text>
    </HStack>
  );
}
