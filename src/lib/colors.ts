/** Shared dark-terminal color palette. Use these constants in layout/workspace
 *  components where Chakra theme tokens are unavailable or inconvenient. */
export const C = {
  canvas:       '#0d1117',
  surface:      '#161b22',
  elevated:     '#1c2128',
  hover:        '#22272e',
  active:       '#2d333b',
  border:       '#30363d',
  borderStrong: '#444c56',
  text:         '#e6edf3',
  textSub:      '#adbac7',
  textMuted:    '#8b949e',
  green:        '#1ec45e',
  greenDim:     'rgba(30,196,94,0.10)',
  greenGlow:    'rgba(30,196,94,0.18)',
  red:          '#f85149',
  redDim:       'rgba(248,81,73,0.12)',
  amber:        '#d29922',
  blue:         '#58a6ff',
  leftRail:     '#0d1117',
} as const;
