import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

// ─── Palette ─────────────────────────────────────────────────────────────────

const colors = {
  brand: {
    50:  '#e6faf0',
    100: '#b3f0d0',
    200: '#80e6b0',
    300: '#4ddb90',
    400: '#26d474',
    500: '#1ec45e',
    600: '#18a84f',
    700: '#128c40',
    800: '#0c7031',
    900: '#065422',
  },
};

// ─── Typography ──────────────────────────────────────────────────────────────

const fonts = {
  heading: `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif`,
  body:    `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif`,
  mono:    `'SF Mono', 'Fira Mono', 'Cascadia Code', 'Consolas', monospace`,
};

// ─── Global Styles ────────────────────────────────────────────────────────────

const styles = {
  global: {
    'html, body': {
      bg:         '#0d1117',
      color:      '#e6edf3',
      fontSize:   '16px',
      lineHeight: 1.5,
    },
    // Thin dark scrollbars
    '::-webkit-scrollbar':       { width: '5px', height: '5px' },
    '::-webkit-scrollbar-track': { bg: 'transparent' },
    '::-webkit-scrollbar-thumb': { bg: '#30363d', borderRadius: '10px' },
    '::-webkit-scrollbar-thumb:hover': { bg: '#444c56' },
    // Select option bg
    'select option': { bg: '#1c2128', color: '#e6edf3' },
  },
};

// ─── Component Overrides ─────────────────────────────────────────────────────

const components = {

  // ── Button ──────────────────────────────────────────────────────────────
  Button: {
    baseStyle: {
      borderRadius: 'md',
      fontWeight: 500,
      _focus: { boxShadow: 'none' },
      _focusVisible: { boxShadow: '0 0 0 2px #1ec45e' },
    },
    variants: {
      solid: (p: { colorScheme?: string }) => {
        if (p.colorScheme === 'red') return {
          bg: '#f85149', color: 'white',
          _hover: { bg: '#e84240', _disabled: { bg: '#f85149' } },
        };
        // default brand
        return {
          bg: 'brand.500', color: 'white',
          _hover: { bg: 'brand.600', _disabled: { bg: 'brand.500' } },
          _active: { bg: 'brand.700' },
        };
      },
      outline: (p: { colorScheme?: string }) => {
        if (p.colorScheme === 'red') return {
          borderColor: '#f85149', color: '#f85149',
          _hover: { bg: 'rgba(248,81,73,0.1)' },
        };
        return {
          borderColor: '#30363d', color: '#8b949e',
          _hover: { bg: '#22272e', color: '#e6edf3', borderColor: '#444c56' },
        };
      },
      ghost: {
        color: '#8b949e',
        _hover: { bg: '#22272e', color: '#e6edf3' },
        _active: { bg: '#2d333b' },
      },
      // Compact uppercase terminal-style button
      terminal: {
        bg: 'transparent',
        color: '#8b949e',
        border: '1px solid',
        borderColor: '#30363d',
        borderRadius: 'sm',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        h: 7,
        px: 3,
        _hover: { bg: '#22272e', color: '#e6edf3', borderColor: '#444c56' },
        _active: { bg: '#2d333b' },
        _disabled: { opacity: 0.35, cursor: 'not-allowed' },
      },
    },
    defaultProps: { colorScheme: 'brand' },
  },

  // ── IconButton ──────────────────────────────────────────────────────────
  IconButton: {
    baseStyle: {
      _focus: { boxShadow: 'none' },
      _focusVisible: { boxShadow: '0 0 0 2px #1ec45e' },
    },
    variants: {
      ghost: {
        color: '#8b949e',
        _hover: { bg: '#22272e', color: '#e6edf3' },
      },
    },
  },

  // ── Card ────────────────────────────────────────────────────────────────
  Card: {
    baseStyle: {
      container: {
        bg: '#161b22',
        border: '1px solid',
        borderColor: '#30363d',
        borderRadius: 'lg',
        overflow: 'hidden',
      },
      header: {
        py: 3, px: 4,
        borderBottom: '1px solid', borderColor: '#30363d',
      },
      body: { py: 3, px: 4 },
      footer: {
        py: 3, px: 4,
        borderTop: '1px solid', borderColor: '#30363d',
      },
    },
  },

  // ── Modal ───────────────────────────────────────────────────────────────
  Modal: {
    baseStyle: {
      overlay: { bg: 'blackAlpha.800' },
      dialog: {
        bg: '#161b22',
        border: '1px solid', borderColor: '#30363d',
        boxShadow: '0 24px 48px rgba(0,0,0,0.7)',
        color: '#e6edf3',
        mx: 4,
      },
      header: {
        borderBottom: '1px solid', borderColor: '#30363d',
        color: '#e6edf3', fontSize: 'md', fontWeight: 600,
        py: 4, px: 5,
      },
      body:   { py: 5, px: 5, color: '#e6edf3' },
      footer: {
        borderTop: '1px solid', borderColor: '#30363d',
        py: 3, px: 5, gap: 2,
      },
      closeButton: {
        color: '#8b949e', top: 3, right: 4,
        _hover: { bg: '#22272e', color: '#e6edf3' },
      },
    },
  },

  // AlertDialog inherits Modal styles automatically
  AlertDialog: {},

  // ── Drawer ──────────────────────────────────────────────────────────────
  Drawer: {
    baseStyle: {
      overlay: { bg: 'blackAlpha.800' },
      dialog: {
        bg: '#161b22',
        boxShadow: '4px 0 32px rgba(0,0,0,0.7)',
        color: '#e6edf3',
      },
      header: {
        borderBottom: '1px solid', borderColor: '#30363d',
        color: '#e6edf3', py: 4, px: 4,
      },
      body:  { p: 0, color: '#e6edf3' },
      closeButton: {
        color: '#8b949e',
        _hover: { bg: '#22272e', color: '#e6edf3' },
      },
    },
  },

  // ── Input ───────────────────────────────────────────────────────────────
  Input: {
    variants: {
      outline: {
        field: {
          bg: '#1c2128', borderColor: '#30363d',
          color: '#e6edf3', fontSize: 'sm',
          _placeholder: { color: '#6e7681' },
          _hover: { borderColor: '#444c56' },
          _focus: { borderColor: '#1ec45e', boxShadow: '0 0 0 1px #1ec45e', bg: '#1c2128' },
          _invalid: { borderColor: '#f85149', boxShadow: '0 0 0 1px #f85149' },
          _dark: {
            bg: '#1c2128', borderColor: '#30363d', color: '#e6edf3',
          },
        },
      },
    },
    defaultProps: { variant: 'outline', focusBorderColor: 'brand.500' },
  },

  // ── NumberInput ─────────────────────────────────────────────────────────
  NumberInput: {
    variants: {
      outline: {
        field: {
          bg: '#1c2128', borderColor: '#30363d',
          color: '#e6edf3', fontSize: 'sm',
          _placeholder: { color: '#6e7681' },
          _hover: { borderColor: '#444c56' },
          _focus: { borderColor: '#1ec45e', boxShadow: '0 0 0 1px #1ec45e' },
          _dark: { bg: '#1c2128', borderColor: '#30363d', color: '#e6edf3' },
        },
        stepper: {
          borderColor: '#30363d', color: '#8b949e',
          _hover: { bg: '#22272e' },
        },
      },
    },
    defaultProps: { variant: 'outline' },
  },

  // ── Select ──────────────────────────────────────────────────────────────
  Select: {
    variants: {
      outline: {
        field: {
          bg: '#1c2128', borderColor: '#30363d',
          color: '#e6edf3', fontSize: 'sm',
          _hover: { borderColor: '#444c56' },
          _focus: { borderColor: '#1ec45e', boxShadow: '0 0 0 1px #1ec45e' },
          _dark: { bg: '#1c2128', borderColor: '#30363d', color: '#e6edf3' },
        },
        icon: { color: '#8b949e' },
      },
    },
    defaultProps: { variant: 'outline' },
  },

  // ── Textarea ────────────────────────────────────────────────────────────
  Textarea: {
    variants: {
      outline: {
        bg: '#1c2128', borderColor: '#30363d',
        color: '#e6edf3', fontSize: 'sm',
        _placeholder: { color: '#6e7681' },
        _hover: { borderColor: '#444c56' },
        _focus: { borderColor: '#1ec45e', boxShadow: '0 0 0 1px #1ec45e' },
        _dark: { bg: '#1c2128', borderColor: '#30363d', color: '#e6edf3' },
      },
    },
    defaultProps: { variant: 'outline' },
  },

  // ── FormLabel ───────────────────────────────────────────────────────────
  FormLabel: {
    baseStyle: {
      color: '#8b949e',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      mb: 1.5,
    },
  },

  // ── FormErrorMessage ────────────────────────────────────────────────────
  FormErrorMessage: {
    baseStyle: { color: '#f85149', fontSize: 'xs', mt: 1 },
  },

  // ── Menu ────────────────────────────────────────────────────────────────
  Menu: {
    baseStyle: {
      list: {
        bg: '#1c2128', border: '1px solid', borderColor: '#30363d',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        borderRadius: 'lg', py: 1.5, minW: '160px',
      },
      item: {
        bg: 'transparent', color: '#e6edf3', fontSize: 'sm',
        py: 2, px: 3,
        _hover: { bg: '#22272e' }, _focus: { bg: '#22272e' },
      },
      divider: { borderColor: '#30363d', my: 1 },
    },
  },

  // ── Tabs ────────────────────────────────────────────────────────────────
  Tabs: {
    variants: {
      workspace: {
        tablist: {
          borderBottom: '1px solid', borderColor: '#30363d',
          bg: 'transparent',
        },
        tab: {
          fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: '#6e7681',
          py: 2.5, px: 4,
          borderBottom: '2px solid transparent',
          borderRadius: 0, mr: 0,
          _selected: { color: '#1ec45e', borderBottomColor: '#1ec45e', bg: 'transparent' },
          _hover: { color: '#e6edf3', bg: '#1c2128' },
          _focus: { boxShadow: 'none' },
        },
        tabpanel: { px: 0, py: 4 },
      },
      line: {
        tab: {
          color: '#8b949e',
          _selected: { color: '#1ec45e', borderColor: '#1ec45e' },
          _hover: { color: '#e6edf3' },
        },
      },
    },
    defaultProps: { variant: 'workspace', colorScheme: 'brand' },
  },

  // ── Table ───────────────────────────────────────────────────────────────
  Table: {
    variants: {
      simple: {
        thead: { th: { borderColor: '#30363d' } },
        tbody: { tr: {
          _hover: { bg: '#1c2128' },
          td: { borderColor: '#30363d' },
        }},
        th: {
          color: '#6e7681', fontSize: '10px',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          fontWeight: 600, py: 2, px: 3, borderColor: '#30363d',
        },
        td: {
          color: '#e6edf3', fontSize: 'sm',
          py: 2.5, px: 3, borderColor: '#30363d',
        },
      },
    },
  },

  // ── Alert ───────────────────────────────────────────────────────────────
  Alert: {
    variants: {
      subtle: (p: { status?: string }) => {
        const map: Record<string, string> = {
          error:   'rgba(248,81,73,0.12)',
          warning: 'rgba(210,153,34,0.12)',
          info:    'rgba(88,166,255,0.12)',
          success: 'rgba(30,196,94,0.12)',
        };
        return {
          container: {
            bg: map[p.status ?? 'info'] ?? 'rgba(255,255,255,0.06)',
            border: '1px solid',
            borderColor: '#30363d',
            borderRadius: 'md',
          },
        };
      },
    },
  },

  // ── Badge ───────────────────────────────────────────────────────────────
  Badge: {
    baseStyle: {
      borderRadius: 'sm',
      fontSize: '10px', fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      px: 1.5, py: 0.5,
    },
  },

  // ── Divider ─────────────────────────────────────────────────────────────
  Divider: {
    baseStyle: { borderColor: '#30363d', opacity: 1 },
  },

  // ── Checkbox ────────────────────────────────────────────────────────────
  Checkbox: {
    baseStyle: {
      control: {
        borderColor: '#444c56', bg: '#1c2128',
        _checked: { bg: 'brand.500', borderColor: 'brand.500', _hover: { bg: 'brand.600' } },
        _hover: { borderColor: '#8b949e' },
        _dark: { borderColor: '#444c56', bg: '#1c2128' },
      },
      label: { color: '#e6edf3', fontSize: 'sm' },
    },
    defaultProps: { colorScheme: 'brand' },
  },

  // ── Switch ──────────────────────────────────────────────────────────────
  Switch: {
    baseStyle: {
      track: {
        bg: '#30363d',
        _checked: { bg: 'brand.500' },
        _dark: { bg: '#30363d', _checked: { bg: 'brand.500' } },
      },
    },
    defaultProps: { colorScheme: 'brand' },
  },

  // ── Radio ───────────────────────────────────────────────────────────────
  Radio: {
    baseStyle: {
      control: {
        borderColor: '#444c56',
        _checked: { borderColor: 'brand.500', bg: 'brand.500', _before: { bg: 'white' } },
        _dark: { borderColor: '#444c56' },
      },
      label: { color: '#e6edf3', fontSize: 'sm' },
    },
    defaultProps: { colorScheme: 'brand' },
  },

  // ── Tooltip ─────────────────────────────────────────────────────────────
  Tooltip: {
    baseStyle: {
      bg: '#22272e', color: '#e6edf3',
      border: '1px solid', borderColor: '#30363d',
      fontSize: 'xs', px: 2, py: 1, borderRadius: 'sm',
    },
  },

  // ── Skeleton ────────────────────────────────────────────────────────────
  Skeleton: {
    baseStyle: { borderRadius: 'md' },
    defaultProps: { startColor: '#1c2128', endColor: '#22272e' },
  },

  // ── Avatar ──────────────────────────────────────────────────────────────
  Avatar: {
    defaultProps: { bg: 'brand.500', color: 'white' },
    baseStyle: {
      container: { bg: 'brand.500', color: 'white' },
      excessLabel: { bg: '#2d333b', color: '#8b949e', border: 'none' },
    },
  },

  // ── Breadcrumb ──────────────────────────────────────────────────────────
  Breadcrumb: {
    baseStyle: {
      link: {
        color: '#8b949e',
        _hover: { color: '#1ec45e', textDecoration: 'none' },
      },
    },
  },

  // ── Popover ─────────────────────────────────────────────────────────────
  Popover: {
    baseStyle: {
      content: {
        bg: '#1c2128', border: '1px solid', borderColor: '#30363d',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)', color: '#e6edf3',
        _dark: { bg: '#1c2128', borderColor: '#30363d' },
      },
      header: { borderColor: '#30363d', color: '#e6edf3', fontSize: 'sm', fontWeight: 600 },
      body:   { color: '#e6edf3', fontSize: 'sm' },
      arrow:  { bg: '#1c2128 !important' },
    },
  },
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const theme = extendTheme({ config, colors, fonts, styles, components });
