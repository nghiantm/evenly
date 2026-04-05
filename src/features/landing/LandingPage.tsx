import {
  Box, VStack, HStack, Text, Button, Container, Divider,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  SimpleGrid, Badge, Grid, Image,
} from '@chakra-ui/react';
import { CheckIcon, ArrowForwardIcon, LockIcon, CheckCircleIcon, StarIcon } from '@chakra-ui/icons';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { C } from '@/lib/colors';

export function LandingPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box bg={C.canvas} minH="100vh" color={C.text}>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <UseCasesSection />
      <AppPreviewSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </Box>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <Box
      position="sticky" top={0} zIndex={100}
      bg={`${C.canvas}e6`} backdropFilter="blur(12px)"
      borderBottom="1px solid" borderColor={C.border}
    >
      <Container maxW="6xl">
        <HStack h={14} justify="space-between">
          <HStack spacing={2.5}>
            <Image src="/evenly-logo.svg" w={8} h={8} flexShrink={0} />
            <Text fontWeight="700" fontSize="lg" color={C.text}>Evenly</Text>
          </HStack>

          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            {[
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map(({ label, href }) => (
              <Text
                key={label} as="a" href={href}
                fontSize="sm" color={C.textMuted}
                _hover={{ color: C.text }} cursor="pointer" transition="color 0.15s"
              >
                {label}
              </Text>
            ))}
          </HStack>

          <HStack spacing={2}>
            <Button as={RouterLink} to="/sign-in" variant="ghost" size="sm">Sign In</Button>
            <Button as={RouterLink} to="/sign-up" size="sm">Get Started</Button>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Box
      pt={{ base: 16, md: 24 }} pb={{ base: 16, md: 20 }}
      background={`radial-gradient(ellipse 80% 50% at 50% -10%, rgba(30,196,94,0.10) 0%, transparent 70%)`}
      borderBottom="1px solid" borderColor={C.border}
    >
      <Container maxW="6xl">
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
          {/* Copy */}
          <VStack align={{ base: 'center', lg: 'start' }} spacing={6} textAlign={{ base: 'center', lg: 'left' }}>
            <Badge
              colorScheme="green" variant="subtle" fontSize="xs" px={3} py={1}
              borderRadius="full" border="1px solid" borderColor={C.greenGlow}
            >
              Free forever — no credit card needed
            </Badge>

            <VStack align={{ base: 'center', lg: 'start' }} spacing={3}>
              <Text
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                fontWeight="800" lineHeight={1.1} color={C.text} letterSpacing="-0.02em"
              >
                Split expenses.{' '}
                <Text as="span" color="brand.500">Not friendships.</Text>
              </Text>
              <Text fontSize={{ base: 'md', md: 'lg' }} color={C.textSub} maxW="480px" lineHeight={1.7}>
                Track shared bills, calculate balances, and settle up with friends, roommates, and travel
                groups — without the awkward money conversations.
              </Text>
            </VStack>

            <HStack spacing={3} flexWrap="wrap" justify={{ base: 'center', lg: 'start' }}>
              <Button as={RouterLink} to="/sign-up" size="lg" px={8}>
                Get Started Free
              </Button>
              <Button
                as={RouterLink} to="/sign-in" size="lg" variant="outline" px={8}
                rightIcon={<ArrowForwardIcon />}
              >
                Sign In
              </Button>
            </HStack>

            <HStack spacing={6} color={C.textMuted} fontSize="sm">
              {['No credit card required', 'Unlimited groups', 'Free forever'].map(t => (
                <HStack key={t} spacing={1.5}>
                  <CheckIcon boxSize={3} color="brand.500" />
                  <Text>{t}</Text>
                </HStack>
              ))}
            </HStack>
          </VStack>

          {/* App mock */}
          <Box display="flex" justifyContent={{ base: 'center', lg: 'flex-end' }}>
            <DashboardMock />
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}

function DashboardMock() {
  const expenses = [
    { desc: 'Dinner at Nobu', amount: '$180.00', sub: 'Split equally · 4 people', cat: 'Food', color: '#f97316' },
    { desc: 'Hotel (4 nights)', amount: '$640.00', sub: 'Split equally · 4 people', cat: 'Hotel', color: '#8b5cf6' },
    { desc: 'Uber to Airport', amount: '$32.00', sub: 'Split equally · 3 people', cat: 'Transit', color: '#3b82f6' },
    { desc: 'Team Building', amount: '$250.00', sub: 'Split by shares', cat: 'Fun', color: '#ec4899' },
  ];

  return (
    <Box
      borderRadius="xl" border="1px solid" borderColor={C.border}
      overflow="hidden" bg={C.surface}
      boxShadow="0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(30,196,94,0.08)"
      maxW="400px" w="full"
    >
      {/* Window chrome */}
      <HStack px={3} py={2} bg={C.elevated} borderBottom="1px solid" borderColor={C.border} spacing={1.5}>
        <Box w={2.5} h={2.5} borderRadius="full" bg="#f85149" opacity={0.8} />
        <Box w={2.5} h={2.5} borderRadius="full" bg="#d29922" opacity={0.8} />
        <Box w={2.5} h={2.5} borderRadius="full" bg={C.green} opacity={0.8} />
        <Text flex={1} textAlign="center" fontSize="xs" color={C.textMuted}>Evenly — Vegas Trip</Text>
      </HStack>

      {/* Group header */}
      <HStack px={4} py={3} borderBottom="1px solid" borderColor={C.border} justify="space-between">
        <VStack align="start" spacing={0}>
          <Text fontWeight="700" fontSize="md" color={C.text}>Vegas Trip</Text>
          <Text fontSize="xs" color={C.textMuted}>4 members</Text>
        </VStack>
        <Badge colorScheme="green" fontSize="9px">Active</Badge>
      </HStack>

      {/* Balance strip */}
      <Grid templateColumns="repeat(3, 1fr)" borderBottom="1px solid" borderColor={C.border}>
        {[
          { label: 'You Owe', amount: '$47.50', color: C.red },
          { label: 'Net Balance', amount: '-$47.50', color: C.red },
          { label: 'Owed to You', amount: '$0.00', color: C.textMuted },
        ].map((item, i) => (
          <Box
            key={item.label} px={3} py={2.5}
            borderRight={i < 2 ? '1px solid' : 'none'} borderColor={C.border}
          >
            <Text fontSize="9px" color={C.textMuted} textTransform="uppercase" letterSpacing="wide" mb={0.5}>
              {item.label}
            </Text>
            <Text fontFamily="mono" fontWeight="800" fontSize="md" color={item.color} lineHeight={1}>
              {item.amount}
            </Text>
          </Box>
        ))}
      </Grid>

      {/* Expense list */}
      <Box>
        <Text px={4} pt={3} pb={1.5} fontSize="9px" color={C.textMuted} textTransform="uppercase" letterSpacing="wide" fontWeight={700}>
          Recent Expenses
        </Text>
        <VStack align="stretch" spacing={0} divider={<Divider borderColor={C.border} />}>
          {expenses.map((exp) => (
            <HStack key={exp.desc} px={4} py={2.5} justify="space-between">
              <HStack spacing={2.5}>
                <Box
                  w={7} h={7} borderRadius="md" flexShrink={0}
                  bg={`${exp.color}20`} border="1px solid" borderColor={`${exp.color}40`}
                  display="flex" alignItems="center" justifyContent="center"
                >
                  <Box w={2} h={2} borderRadius="full" bg={exp.color} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color={C.text}>{exp.desc}</Text>
                  <Text fontSize="10px" color={C.textMuted}>{exp.sub}</Text>
                </VStack>
              </HStack>
              <VStack align="end" spacing={0.5}>
                <Text fontFamily="mono" fontSize="sm" fontWeight="700" color={C.text}>{exp.amount}</Text>
                <Badge fontSize="8px" colorScheme="gray" variant="subtle">{exp.cat}</Badge>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatsSection() {
  const stats = [
    { value: '20+', label: 'Groups Created' },
    { value: '1000+', label: 'Expenses Tracked' },
    { value: '$100K+', label: 'Settled Between Friends' },
  ];

  const testimonials = [
    { quote: "Finally an expense app that doesn't charge me for basic features. Evenly is exactly what my roommates needed.", name: 'Tra L.', context: 'Roommate group' },
    { quote: "Used it for our Europe trip with 6 friends. No arguments about money at all — the app handled everything.", name: 'Quyen N.', context: 'Travel group' },
    { quote: "Simple, fast, and free. I've tried four other apps. Evenly is the one we actually stuck with.", name: 'Quan N.', context: 'Friend group' },
  ];

  return (
    <Box py={{ base: 16, md: 20 }} borderBottom="1px solid" borderColor={C.border}>
      <Container maxW="6xl">
        <VStack spacing={12}>
          {/* Stats row */}
          <VStack spacing={2}>
            <Text fontSize="xs" color={C.textMuted} textTransform="uppercase" letterSpacing="widest" fontWeight={700}>
              Trusted by groups everywhere
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full" pt={4}>
              {stats.map(({ value, label }) => (
                <VStack key={label} spacing={1}>
                  <Text fontFamily="mono" fontSize="4xl" fontWeight="800" color="brand.500" lineHeight={1}>
                    {value}
                  </Text>
                  <Text fontSize="sm" color={C.textMuted}>{label}</Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>

          <Divider borderColor={C.border} />

          {/* Testimonials */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
            {testimonials.map(({ quote, name, context }) => (
              <Box
                key={name} p={5} borderRadius="lg" border="1px solid" borderColor={C.border}
                bg={C.surface}
              >
                <HStack mb={3} spacing={0.5}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} boxSize={3} color="brand.500" />
                  ))}
                </HStack>
                <Text fontSize="sm" color={C.textSub} lineHeight={1.7} mb={4}>
                  "{quote}"
                </Text>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="600" color={C.text}>{name}</Text>
                  <Text fontSize="xs" color={C.textMuted}>{context}</Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      symbol: '#', color: C.green,
      title: 'Group Management',
      desc: 'Create groups for any situation — trips, roommates, couples, or one-off events. Invite anyone by email.',
    },
    {
      symbol: '+', color: C.blue,
      title: 'Quick Expense Entry',
      desc: 'Log an expense in seconds. Add a description, amount, and choose who paid. Done.',
    },
    {
      symbol: '=', color: '#f97316',
      title: 'Automatic Balances',
      desc: 'Balances update instantly after every expense. Always know exactly who owes what at a glance.',
    },
    {
      symbol: '%', color: '#8b5cf6',
      title: 'Flexible Splitting',
      desc: 'Split equally, by exact amounts, percentages, or custom shares. Whatever fits the situation.',
    },
    {
      symbol: '$', color: '#ec4899',
      title: 'Settlement Tracking',
      desc: 'Record payments and mark debts as settled. Keep a clear history of every transaction.',
    },
    {
      symbol: '~', color: C.amber,
      title: 'Full Transparency',
      desc: 'Every member can see the full expense history. No surprises, no confusion, no disputes.',
    },
  ];

  return (
    <Box id="features" py={{ base: 16, md: 24 }} borderBottom="1px solid" borderColor={C.border}>
      <Container maxW="6xl">
        <VStack spacing={12}>
          <VStack spacing={3} textAlign="center">
            <Text fontSize="xs" color="brand.500" textTransform="uppercase" letterSpacing="widest" fontWeight={700}>
              Features
            </Text>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={C.text} letterSpacing="-0.02em">
              Everything you need to split fairly
            </Text>
            <Text fontSize="md" color={C.textSub} maxW="480px" lineHeight={1.7}>
              No bloat. No paywalls. Just the tools that make shared expenses easy.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="full">
            {features.map(({ symbol, color, title, desc }) => (
              <Box
                key={title} p={5} borderRadius="lg" border="1px solid" borderColor={C.border}
                bg={C.surface} _hover={{ borderColor: C.borderStrong, bg: C.elevated }}
                transition="all 0.2s"
              >
                <Box
                  w={10} h={10} borderRadius="lg" mb={4}
                  bg={`${color}18`} border="1px solid" borderColor={`${color}30`}
                  display="flex" alignItems="center" justifyContent="center"
                >
                  <Text color={color} fontWeight="800" fontSize="lg" fontFamily="mono">{symbol}</Text>
                </Box>
                <Text fontWeight="600" fontSize="md" color={C.text} mb={2}>{title}</Text>
                <Text fontSize="sm" color={C.textMuted} lineHeight={1.7}>{desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      n: '01', title: 'Create a Group',
      desc: 'Start a group for your trip, household, or friend circle. Invite members by email — they can join in seconds.',
    },
    {
      n: '02', title: 'Add Expenses',
      desc: 'Log any shared expense as it happens. Choose who paid, how to split it, and add a note if needed.',
    },
    {
      n: '03', title: 'Track Balances',
      desc: 'Evenly calculates every balance automatically. See a clear picture of who owes who across the whole group.',
    },
    {
      n: '04', title: 'Settle Up',
      desc: 'When it\'s time to pay up, record the settlement. Balances clear and everyone starts fresh.',
    },
  ];

  return (
    <Box id="how-it-works" py={{ base: 16, md: 24 }} bg={C.surface} borderBottom="1px solid" borderColor={C.border}>
      <Container maxW="6xl">
        <VStack spacing={12}>
          <VStack spacing={3} textAlign="center">
            <Text fontSize="xs" color="brand.500" textTransform="uppercase" letterSpacing="widest" fontWeight={700}>
              How It Works
            </Text>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={C.text} letterSpacing="-0.02em">
              Up and running in minutes
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
            {steps.map(({ n, title, desc }) => (
              <VStack key={n} align="start" spacing={4} p={5} borderRadius="lg"
                border="1px solid" borderColor={C.border} bg={C.canvas}
              >
                <Text
                  fontFamily="mono" fontSize="xs" fontWeight="700"
                  color="brand.500" letterSpacing="widest"
                >
                  {n}
                </Text>
                <Text fontWeight="600" fontSize="md" color={C.text}>{title}</Text>
                <Text fontSize="sm" color={C.textMuted} lineHeight={1.7}>{desc}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}

// ─── Use Cases ────────────────────────────────────────────────────────────────

function UseCasesSection() {
  const cases = [
    {
      title: 'Roommates',
      desc: 'Split rent, utilities, groceries, and household supplies month after month without the friction.',
      tags: ['Rent', 'Utilities', 'Groceries', 'Subscriptions'],
      color: C.green,
    },
    {
      title: 'Travel Groups',
      desc: 'Hotels, flights, restaurants, activities — log everything on the go and settle once you\'re home.',
      tags: ['Hotels', 'Flights', 'Meals', 'Activities'],
      color: C.blue,
    },
    {
      title: 'Couples',
      desc: 'Track who paid for what without keeping a mental scorecard. Keep things fair and transparent.',
      tags: ['Dining', 'Date nights', 'Subscriptions', 'Groceries'],
      color: '#ec4899',
    },
    {
      title: 'Friend Groups',
      desc: 'Concerts, dinners, road trips — one person pays, everyone settles up later without awkwardness.',
      tags: ['Dinners', 'Events', 'Road trips', 'Gifts'],
      color: '#f97316',
    },
    {
      title: 'Event Planning',
      desc: 'Coordinate costs across multiple people for parties, weddings, or any group event.',
      tags: ['Venues', 'Catering', 'Decorations', 'Deposits'],
      color: '#8b5cf6',
    },
  ];

  return (
    <Box py={{ base: 16, md: 24 }} borderBottom="1px solid" borderColor={C.border}>
      <Container maxW="6xl">
        <VStack spacing={12}>
          <VStack spacing={3} textAlign="center">
            <Text fontSize="xs" color="brand.500" textTransform="uppercase" letterSpacing="widest" fontWeight={700}>
              Use Cases
            </Text>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={C.text} letterSpacing="-0.02em">
              Built for every kind of group
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="full">
            {cases.map(({ title, desc, tags, color }) => (
              <Box
                key={title} p={5} borderRadius="lg" border="1px solid"
                borderColor={C.border} bg={C.surface}
                _hover={{ borderColor: color + '60' }} transition="border-color 0.2s"
              >
                <Box w={1} h={8} bg={color} borderRadius="full" mb={4} />
                <Text fontWeight="700" fontSize="md" color={C.text} mb={2}>{title}</Text>
                <Text fontSize="sm" color={C.textMuted} lineHeight={1.7} mb={4}>{desc}</Text>
                <HStack flexWrap="wrap" spacing={1.5} gap={1.5}>
                  {tags.map(tag => (
                    <Badge
                      key={tag} fontSize="9px" colorScheme="gray"
                      variant="subtle" px={2} py={0.5} borderRadius="sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}

// ─── App Preview ──────────────────────────────────────────────────────────────

function AppPreviewSection() {
  return (
    <Box py={{ base: 16, md: 24 }} bg={C.surface} borderBottom="1px solid" borderColor={C.border}>
      <Container maxW="6xl">
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
          <VStack align={{ base: 'center', lg: 'start' }} spacing={5} textAlign={{ base: 'center', lg: 'left' }}>
            <Text fontSize="xs" color="brand.500" textTransform="uppercase" letterSpacing="widest" fontWeight={700}>
              The App
            </Text>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={C.text} letterSpacing="-0.02em">
              Designed to be fast and clear
            </Text>
            <Text fontSize="md" color={C.textSub} lineHeight={1.7}>
              Evenly is a web app — no download required. Open it on any device,
              any browser, any time. Your data is always in sync across the group.
            </Text>
            <VStack align={{ base: 'center', lg: 'start' }} spacing={3}>
              {[
                'See group balances at a glance',
                'Browse the full expense history',
                'Record payments and settlements',
                'Manage multiple groups in one place',
              ].map(item => (
                <HStack key={item} spacing={2.5}>
                  <CheckCircleIcon boxSize={4} color="brand.500" />
                  <Text fontSize="sm" color={C.textSub}>{item}</Text>
                </HStack>
              ))}
            </VStack>
            <Button as={RouterLink} to="/sign-up" size="md" rightIcon={<ArrowForwardIcon />}>
              Try It Free
            </Button>
          </VStack>

          {/* Balance mock */}
          <Box display="flex" justifyContent={{ base: 'center', lg: 'flex-end' }}>
            <BalanceMock />
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}

function BalanceMock() {
  const members = [
    { name: 'Alex R.', initials: 'AR', owes: null, owed: 94.50, color: C.green },
    { name: 'Sarah K.', initials: 'SK', owes: 47.50, owed: null, color: C.red },
    { name: 'Marcus T.', initials: 'MT', owes: 23.00, owed: null, color: C.red },
    { name: 'You', initials: 'YO', owes: null, owed: 24.00, color: C.green },
  ];

  return (
    <Box
      borderRadius="xl" border="1px solid" borderColor={C.border}
      overflow="hidden" bg={C.canvas}
      boxShadow="0 24px 60px rgba(0,0,0,0.7)"
      maxW="380px" w="full"
    >
      <HStack px={3} py={2} bg={C.elevated} borderBottom="1px solid" borderColor={C.border} spacing={1.5}>
        <Box w={2.5} h={2.5} borderRadius="full" bg="#f85149" opacity={0.8} />
        <Box w={2.5} h={2.5} borderRadius="full" bg="#d29922" opacity={0.8} />
        <Box w={2.5} h={2.5} borderRadius="full" bg={C.green} opacity={0.8} />
        <Text flex={1} textAlign="center" fontSize="xs" color={C.textMuted}>Balances — Road Trip</Text>
      </HStack>

      <Box px={4} py={3} borderBottom="1px solid" borderColor={C.border}>
        <Text fontSize="10px" color={C.textMuted} textTransform="uppercase" letterSpacing="wide" fontWeight={700} mb={3}>
          Member Balances
        </Text>
        <VStack align="stretch" spacing={0} divider={<Divider borderColor={C.border} />}>
          {members.map(({ name, initials, owes, owed, color }) => (
            <HStack key={name} py={2.5} justify="space-between">
              <HStack spacing={2.5}>
                <Box
                  w={7} h={7} borderRadius="full" bg="brand.500"
                  display="flex" alignItems="center" justifyContent="center" flexShrink={0}
                >
                  <Text fontSize="10px" fontWeight="700" color="white">{initials}</Text>
                </Box>
                <Text fontSize="sm" color={C.text}>{name}</Text>
              </HStack>
              <VStack align="end" spacing={0}>
                <Text fontFamily="mono" fontSize="sm" fontWeight="700" color={color}>
                  {owes ? `-$${owes.toFixed(2)}` : `+$${owed?.toFixed(2)}`}
                </Text>
                <Text fontSize="9px" color={C.textMuted}>{owes ? 'owes' : 'is owed'}</Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Box>

      <HStack px={4} py={3} justify="space-between">
        <VStack align="start" spacing={0}>
          <Text fontSize="9px" color={C.textMuted} textTransform="uppercase" letterSpacing="wide">Total expenses</Text>
          <Text fontFamily="mono" fontWeight="800" fontSize="lg" color={C.text}>$1,102.00</Text>
        </VStack>
        <Button size="xs">Settle Up</Button>
      </HStack>
    </Box>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function PricingSection() {
  const features = [
    'Unlimited groups',
    'Unlimited expenses',
    'Equal, exact, percentage & share splits',
    'Automatic balance calculations',
    'Settlement tracking',
    'Full expense history',
    'Multi-member groups',
    'Access from any device',
  ];

  return (
    <Box id="pricing" py={{ base: 16, md: 24 }} borderBottom="1px solid" borderColor={C.border}>
      <Container maxW="6xl">
        <VStack spacing={12}>
          <VStack spacing={3} textAlign="center">
            <Text fontSize="xs" color="brand.500" textTransform="uppercase" letterSpacing="widest" fontWeight={700}>
              Pricing
            </Text>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={C.text} letterSpacing="-0.02em">
              Free. No strings attached.
            </Text>
            <Text fontSize="md" color={C.textSub} maxW="420px" lineHeight={1.7}>
              Evenly is completely free. All features, all groups, no limits — no credit card required.
            </Text>
          </VStack>

          <Box
            maxW="420px" w="full" mx="auto"
            border="1px solid" borderColor="brand.500"
            borderRadius="xl" overflow="hidden" bg={C.surface}
            boxShadow={`0 0 40px rgba(30,196,94,0.08)`}
          >
            <Box px={6} pt={6} pb={4} borderBottom="1px solid" borderColor={C.border}>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="700" fontSize="lg" color={C.text}>Free Plan</Text>
                  <Text fontSize="sm" color={C.textMuted}>Everything included</Text>
                </VStack>
                <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                  Free Forever
                </Badge>
              </HStack>
              <HStack align="baseline" mt={4} spacing={1}>
                <Text fontFamily="mono" fontSize="4xl" fontWeight="800" color={C.text} lineHeight={1}>$0</Text>
                <Text fontSize="sm" color={C.textMuted}>/ month</Text>
              </HStack>
            </Box>

            <VStack align="stretch" spacing={0} px={6} py={5}>
              {features.map(f => (
                <HStack key={f} py={2} spacing={3}>
                  <CheckIcon boxSize={3.5} color="brand.500" flexShrink={0} />
                  <Text fontSize="sm" color={C.textSub}>{f}</Text>
                </HStack>
              ))}
            </VStack>

            <Box px={6} pb={6}>
              <Button as={RouterLink} to="/sign-up" w="full" size="md">
                Get Started Free
              </Button>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

function FaqSection() {
  const faqs = [
    {
      q: 'Is Evenly free to use?',
      a: 'Yes — completely free. All features are available at no cost, with no credit card required to sign up.',
    },
    {
      q: 'How does bill splitting work?',
      a: 'Add an expense, enter the total amount, and choose a split method: equally among selected members, exact amounts, percentages, or custom shares. Evenly handles the math automatically.',
    },
    {
      q: 'Can multiple people pay for one expense?',
      a: 'Yes. When logging an expense you can record that multiple people contributed different amounts toward the total.',
    },
    {
      q: 'Can I use Evenly on my phone?',
      a: 'Evenly is a web app that works in any browser on any device — phone, tablet, or desktop. No download needed.',
    },
    {
      q: 'Can I edit or delete expenses after adding them?',
      a: 'Yes. The person who created an expense can edit or delete it. Group admins and owners can also edit any expense.',
    },
    {
      q: 'Is my financial data secure?',
      a: 'Evenly uses secure authentication and encrypted communication. We do not store any actual payment or banking information — only the expense records you enter.',
    },
  ];

  return (
    <Box id="faq" py={{ base: 16, md: 24 }} bg={C.surface} borderBottom="1px solid" borderColor={C.border}>
      <Container maxW="3xl">
        <VStack spacing={10}>
          <VStack spacing={3} textAlign="center">
            <Text fontSize="xs" color="brand.500" textTransform="uppercase" letterSpacing="widest" fontWeight={700}>
              FAQ
            </Text>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={C.text} letterSpacing="-0.02em">
              Common questions
            </Text>
          </VStack>

          <Accordion allowMultiple w="full" borderColor={C.border}>
            {faqs.map(({ q, a }) => (
              <AccordionItem key={q} border="1px solid" borderColor={C.border} borderRadius="lg" mb={2} overflow="hidden">
                <AccordionButton
                  px={5} py={4} _hover={{ bg: C.elevated }}
                  _expanded={{ bg: C.elevated }}
                >
                  <Text flex={1} textAlign="left" fontSize="sm" fontWeight="600" color={C.text}>{q}</Text>
                  <AccordionIcon color={C.textMuted} />
                </AccordionButton>
                <AccordionPanel px={5} pb={4} pt={0} bg={C.elevated}>
                  <Text fontSize="sm" color={C.textMuted} lineHeight={1.8}>{a}</Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      </Container>
    </Box>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <Box py={{ base: 16, md: 24 }} borderBottom="1px solid" borderColor={C.border}>
      <Container maxW="3xl">
        <Box
          p={{ base: 8, md: 14 }} borderRadius="2xl" textAlign="center"
          border="1px solid" borderColor={C.greenGlow}
          bg={C.surface}
          boxShadow={`0 0 60px rgba(30,196,94,0.07), inset 0 1px 0 rgba(30,196,94,0.1)`}
          background={`radial-gradient(ellipse 100% 80% at 50% 100%, rgba(30,196,94,0.06) 0%, transparent 70%)`}
        >
          <VStack spacing={5}>
            <Image src="/evenly-logo.svg" w={12} h={12} />
            <VStack spacing={2}>
              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={C.text} letterSpacing="-0.02em">
                Start splitting smarter today
              </Text>
              <Text fontSize="md" color={C.textSub} maxW="360px" lineHeight={1.7}>
                Join thousands of groups already using Evenly to keep shared expenses clear and stress-free.
              </Text>
            </VStack>
            <HStack spacing={3} flexWrap="wrap" justify="center">
              <Button as={RouterLink} to="/sign-up" size="lg" px={8}>
                Create Your Free Account
              </Button>
              <Button as={RouterLink} to="/sign-in" size="lg" variant="ghost">
                Sign In
              </Button>
            </HStack>
            <HStack spacing={1.5}>
              <LockIcon boxSize={3} color={C.textMuted} />
              <Text fontSize="xs" color={C.textMuted}>No credit card required. Free forever.</Text>
            </HStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function FooterSection() {
  return (
    <Box py={10} bg={C.elevated}>
      <Container maxW="6xl">
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr 1fr' }} gap={8} mb={10}>
          {/* Brand */}
          <VStack align="start" spacing={3}>
            <HStack spacing={2}>
              <Image src="/evenly-logo.svg" w={7} h={7} />
              <Text fontWeight="700" fontSize="md" color={C.text}>Evenly</Text>
            </HStack>
            <Text fontSize="sm" color={C.textMuted} lineHeight={1.7}>
              Split expenses fairly. No awkward conversations.
            </Text>
          </VStack>

          {/* Product */}
          <VStack align="start" spacing={3}>
            <Text fontSize="xs" color={C.textMuted} textTransform="uppercase" letterSpacing="widest" fontWeight={700}>
              Product
            </Text>
            {[
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map(({ label, href }) => (
              <Text key={label} as="a" href={href} fontSize="sm" color={C.textSub}
                _hover={{ color: C.text }} cursor="pointer" transition="color 0.15s"
              >
                {label}
              </Text>
            ))}
          </VStack>

          {/* Account */}
          <VStack align="start" spacing={3}>
            <Text fontSize="xs" color={C.textMuted} textTransform="uppercase" letterSpacing="widest" fontWeight={700}>
              Account
            </Text>
            {[
              { label: 'Sign Up', to: '/sign-up' },
              { label: 'Sign In', to: '/sign-in' },
              { label: 'Dashboard', to: '/dashboard' },
            ].map(({ label, to }) => (
              <Text key={label} as={RouterLink} to={to} fontSize="sm" color={C.textSub}
                _hover={{ color: C.text }} transition="color 0.15s"
              >
                {label}
              </Text>
            ))}
          </VStack>

          {/* Legal */}
          <VStack align="start" spacing={3}>
            <Text fontSize="xs" color={C.textMuted} textTransform="uppercase" letterSpacing="widest" fontWeight={700}>
              Legal
            </Text>
            {['Privacy Policy', 'Terms of Service', 'Contact'].map(label => (
              <Text key={label} fontSize="sm" color={C.textSub}
                _hover={{ color: C.text }} cursor="pointer" transition="color 0.15s"
              >
                {label}
              </Text>
            ))}
          </VStack>
        </Grid>

        <Divider borderColor={C.border} mb={6} />

        <HStack justify="space-between" flexWrap="wrap" gap={2}>
          <Text fontSize="xs" color={C.textMuted}>
            © {new Date().getFullYear()} Evenly. All rights reserved.
          </Text>
          <Text fontSize="xs" color={C.textMuted}>
            Made for people who split bills without losing friends.
          </Text>
        </HStack>
      </Container>
    </Box>
  );
}
