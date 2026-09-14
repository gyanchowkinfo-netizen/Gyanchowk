/**
 * Gyan Chowk brand tokens — derived from /public/g1.png (sampled 2026-09-13).
 *
 * Dominant clusters in the mark:
 *   Navy / royal blue  — G, graduation cap, GYAN wordmark
 *   Amber gold         — C, CHOWK wordmark, tassel and highlights
 *   Near-white         — 3D specular on the G (not a UI fill)
 *
 * Do not add unrelated blues, purples, cyans, or neons.
 * Use these values in JS (3D, charts). CSS mirrors them as --gyan-* in globals.css.
 */
export const brand = {
  primary: '#003898',
  primaryLight: '#2a62c4',
  primaryDark: '#001850',

  secondary: '#f8b000',
  secondaryLight: '#ffc53a',
  secondaryDark: '#c87800',

  accent: '#f89000',

  background: '#f6f8fc',
  backgroundSecondary: '#eef3fa',
  surface: '#ffffff',

  text: '#001850',
  textSecondary: '#1e3d7a',
  textMuted: '#4d6490',

  border: '#c9d6ea',
  borderHover: '#003898',

  success: '#0f7b4c',
  warning: '#c87800',
  error: '#c43c32',
  info: '#003898',

  footer: '#001850',
  footerText: '#e8eef8',
  footerMuted: '#9aafd0',

  keyLight: '#fff4d6',
  inverse: '#ffffff',
} as const;

export const chartPalette = [
  brand.primary,
  brand.secondary,
  brand.primaryLight,
  brand.accent,
  brand.secondaryDark,
  brand.success,
] as const;

export type BrandToken = keyof typeof brand;
