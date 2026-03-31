import { SignIn, SignUp } from '@clerk/clerk-react';
import { Box, Center, Text, VStack } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { C } from '@/lib/colors';

const clerkDark = {
  variables: {
    colorBackground:        C.surface,
    colorInputBackground:   C.elevated,
    colorText:              C.text,
    colorTextSecondary:     C.textSub,
    colorInputText:         C.text,
    colorPrimary:           C.green,
    colorDanger:            C.red,
    borderRadius:           '6px',
    fontFamily:             'inherit',
  },
  elements: {
    card:                   { background: C.surface, border: `1px solid ${C.border}`, boxShadow: 'none' },
    headerTitle:            { color: C.text },
    headerSubtitle:         { color: C.textMuted },
    dividerLine:            { background: C.border },
    dividerText:            { color: C.textMuted },
    formFieldLabel:         { color: C.textSub },
    formFieldInput:         { background: C.elevated, border: `1px solid ${C.border}`, color: C.text },
    footerActionText:       { color: C.textMuted },
    footerActionLink:       { color: C.green },
    identityPreviewText:    { color: C.textSub },
    identityPreviewEditButton: { color: C.green },
    socialButtonsBlockButton: {
      background: C.elevated,
      border: `1px solid ${C.border}`,
      color: C.text,
    },
    socialButtonsBlockButtonText: { color: C.text },
  },
};

interface AuthPageProps {
  mode: 'sign-in' | 'sign-up';
}

export function AuthPage({ mode }: AuthPageProps) {
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  return (
    <Center minH="100vh" bg={C.canvas}>
      <VStack spacing={6} w="full" maxW="md" px={4}>
        <VStack spacing={1}>
          <Box
            w={10} h={10} bg="brand.500" borderRadius="xl"
            display="flex" alignItems="center" justifyContent="center"
          >
            <Text color="white" fontWeight="bold" fontSize="xl">E</Text>
          </Box>
          <Text fontSize="2xl" fontWeight="bold" color={C.text}>Evenly</Text>
          <Text fontSize="sm" color={C.textMuted}>Split expenses fairly with friends</Text>
        </VStack>

        {mode === 'sign-in' ? (
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            afterSignInUrl={from}
            appearance={clerkDark}
          />
        ) : (
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            afterSignUpUrl={from}
            appearance={clerkDark}
          />
        )}
      </VStack>
    </Center>
  );
}
