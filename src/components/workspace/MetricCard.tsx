import { Box, Text, type BoxProps } from '@chakra-ui/react';
import { C } from '@/lib/colors';

interface MetricCardProps extends BoxProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  valueColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE = {
  sm: { label: '10px', value: 'md'  as const, sub: '11px' },
  md: { label: '10px', value: 'xl'  as const, sub: 'xs'   },
  lg: { label: '10px', value: '2xl' as const, sub: 'xs'   },
};

export function MetricCard({
  label,
  value,
  sub,
  valueColor = C.text,
  size = 'md',
  ...rest
}: MetricCardProps) {
  const s = SIZE[size];
  return (
    <Box {...rest}>
      <Text
        fontSize={s.label}
        color={C.textMuted}
        letterSpacing="0.08em"
        textTransform="uppercase"
        fontWeight={600}
        mb={1}
      >
        {label}
      </Text>
      <Text
        fontFamily="mono"
        fontSize={s.value}
        fontWeight="bold"
        color={valueColor}
        lineHeight={1.2}
      >
        {value}
      </Text>
      {sub && (
        <Text fontSize={s.sub} color={C.textSub} mt={0.5}>
          {sub}
        </Text>
      )}
    </Box>
  );
}
