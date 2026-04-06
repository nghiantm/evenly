import { SignIn, SignUp } from '@clerk/clerk-react';
import { Box, Center, Text, VStack, HStack, Image, Link } from '@chakra-ui/react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
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
    <Box
      minH="100vh"
      bg={C.canvas}
      background={`${C.canvas} radial-gradient(ellipse 80% 50% at 50% -5%, rgba(30,196,94,0.12) 0%, transparent 65%)`}
    >
      {/* Navbar */}
      <Box
        position="sticky" top={0} zIndex={100}
        bg={`${C.canvas}e6`} backdropFilter="blur(12px)"
        borderBottom="1px solid" borderColor={C.border}
      >
        <HStack h={14} px={6} justify="space-between" maxW="6xl" mx="auto">
          <HStack spacing={2.5} as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <Image src="/evenly-logo.svg" w={8} h={8} flexShrink={0} />
            <Text fontWeight="700" fontSize="lg" color={C.text}>Evenly</Text>
          </HStack>
          <HStack spacing={1} fontSize="sm" color={C.textMuted}>
            <Text>{mode === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}</Text>
            <Link
              as={RouterLink}
              to={mode === 'sign-in' ? '/sign-up' : '/sign-in'}
              color={C.green}
              _hover={{ textDecoration: 'underline' }}
            >
              {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
            </Link>
          </HStack>
        </HStack>
      </Box>

      <Center pt={{ base: 8, md: 14 }} pb={16} px={4}>
        <VStack spacing={6} w="full" maxW="md">
          {/* Brand mark */}
          <VStack spacing={1} pb={2}>
            <Text fontSize="2xl" fontWeight="800" color={C.text} letterSpacing="-0.02em">
              {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text fontSize="sm" color={C.textMuted}>
              {mode === 'sign-in'
                ? 'Sign in to continue to Evenly'
                : 'Start splitting expenses fairly with friends'}
            </Text>
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
    </Box>
  );
}
