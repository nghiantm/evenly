import { Box, Text, type BoxProps } from '@chakra-ui/react';
import { C } from '@/lib/colors';

interface PanelSectionProps extends BoxProps {
  label: string;
  children: React.ReactNode;
  noBorder?: boolean;
}

/** A labeled section block inside the right context panel. */
export function PanelSection({ label, children, noBorder, ...rest }: PanelSectionProps) {
  return (
    <Box
      px={4}
      py={3}
      borderBottom={noBorder ? 'none' : '1px solid'}
      borderColor={C.border}
      {...rest}
    >
      <Text
        fontSize="10px"
        color={C.textMuted}
        letterSpacing="0.1em"
        textTransform="uppercase"
        fontWeight={700}
        mb={2.5}
      >
        {label}
      </Text>
      {children}
    </Box>
  );
}
