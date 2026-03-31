import { Box, HStack, VStack, Text, type BoxProps } from '@chakra-ui/react';
import { C } from '@/lib/colors';

interface SectionHeaderProps extends BoxProps {
  title: string;
  eyebrow?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  /** Extra content below the title row (e.g. tabs bar) */
  footer?: React.ReactNode;
}

export function SectionHeader({
  title,
  eyebrow,
  description,
  actions,
  footer,
  ...rest
}: SectionHeaderProps) {
  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      bg={C.canvas}
      borderBottom="1px solid"
      borderColor={C.border}
      {...rest}
    >
      <HStack justify="space-between" align="start" px={5} py={3} minH="54px">
        <VStack align="start" spacing={0.5} flex={1} minW={0}>
          {eyebrow && (
            typeof eyebrow === 'string' ? (
              <Text
                fontSize="10px"
                color={C.textMuted}
                letterSpacing="0.1em"
                textTransform="uppercase"
                fontWeight={600}
                lineHeight={1}
              >
                {eyebrow}
              </Text>
            ) : eyebrow
          )}
          <Text
            fontSize="md"
            fontWeight={700}
            color={C.text}
            lineHeight={1.3}
            noOfLines={1}
          >
            {title}
          </Text>
          {description && (
            <Text fontSize="xs" color={C.textSub} noOfLines={1}>
              {description}
            </Text>
          )}
        </VStack>
        {actions && (
          <HStack spacing={2} flexShrink={0} pt={0.5}>
            {actions}
          </HStack>
        )}
      </HStack>
      {footer}
    </Box>
  );
}
