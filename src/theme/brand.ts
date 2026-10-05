import type { PaletteOptions, Palette } from '@mui/material/styles';

/**
 * Shared brand tokens (Group A1 enterprise polish).
 *
 * The app used 5 different ad-hoc purples (#7a4cff, #6c5ce7, #7c3aed,
 * #5c5470, #a78bfa) for the same "primary action" intent, plus hardcoded chip
 * colors that failed contrast in one of the two modes. These tokens collapse
 * all of that to ONE action purple + mode-safe status chips.
 *
 * Usage: `sx={{ bgcolor: 'brand.main', '&:hover': { bgcolor: 'brand.dark' } }}`
 * or `theme.palette.brand.main`. Augmentation below makes TS accept them.
 */

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary'];
    serviceChip: { bg: string; color: string };
    verifiedBadge: { bg: string; color: string };
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
    serviceChip?: { bg: string; color: string };
    verifiedBadge?: { bg: string; color: string };
  }
}

export const brandPaletteDark: PaletteOptions = {
  brand: {
    main: '#7a4cff',
    light: '#9d7bff',
    dark: '#6a3def',
    contrastText: '#ffffff',
  },
  // Replaces rgba(122,76,255,0.15)/#a78bfa — #a78bfa on light paper fails WCAG.
  serviceChip: {
    bg: 'rgba(122,76,255,0.16)',
    color: '#c4b5fd',
  },
  // Replaces bare #2563eb chip (assumed white text that wasn't set).
  verifiedBadge: {
    bg: '#2563eb',
    color: '#ffffff',
  },
};

export const brandPaletteLight: PaletteOptions = {
  brand: {
    main: '#7a4cff',
    light: '#9d7bff',
    dark: '#6a3def',
    contrastText: '#ffffff',
  },
  serviceChip: {
    bg: 'rgba(122,76,255,0.10)',
    color: '#6d28d9',
  },
  verifiedBadge: {
    bg: '#2563eb',
    color: '#ffffff',
  },
};

/** Twitch / YouTube brand colors — documented exceptions, NOT theme tokens. */
export const PLATFORM_COLORS = {
  twitch: '#9147ff',
  youtube: '#ff4444',
} as const;

/** Single page-width standard (was 900/1100/1200/1400/1500 across pages). */
export const PAGE_MAX_WIDTH = 1400;
