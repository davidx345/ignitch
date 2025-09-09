/**
 * AdFlow Design System - Minimalist Neutral Theme
 * Centralized design tokens and utilities
 */

export const colors = {
  // Primary Colors (Neutral)
  primary: {
    50: '#F9FAFB',
    100: '#F3F4F6', 
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  },
  
  // Accent Colors
  accent: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B'
  },
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Backgrounds
  background: '#FAFAFA',
  surface: '#FFFFFF',
  overlay: 'rgba(17, 24, 39, 0.05)'
} as const

export const typography = {
  fonts: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace']
  },
  
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'  // 36px
  },
  
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
} as const

export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem'      // 96px
} as const

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.375rem', // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px'
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
} as const

// Animation utilities
export const animations = {
  transition: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out'
  },
  
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
} as const

// Component variants
export const variants = {
  button: {
    primary: `bg-primary-800 text-white hover:bg-primary-900 border-transparent`,
    secondary: `bg-primary-100 text-primary-800 hover:bg-primary-200 border-primary-200`,
    outline: `bg-transparent text-primary-700 hover:bg-primary-50 border-primary-300`,
    ghost: `bg-transparent text-primary-600 hover:bg-primary-100 border-transparent`,
    accent: `bg-accent-500 text-white hover:bg-accent-600 border-transparent`
  },
  
  card: {
    default: `bg-surface border border-primary-200 shadow-sm`,
    elevated: `bg-surface border border-primary-200 shadow-md`,
    interactive: `bg-surface border border-primary-200 shadow-sm hover:shadow-md transition-shadow`
  }
} as const
