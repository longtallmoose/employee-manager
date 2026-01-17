// Shared Design System Tokens
// Philosophy: "Calm, Intelligent, Human"

export const DesignTokens = {
  colors: {
    // Primary: Trustworthy Deep Blue (Not standard corporate blue)
    primary: {
      50: '#F0F5F9',
      100: '#D9E2EC',
      200: '#BCCCDC',
      300: '#9FB3C8',
      400: '#829AB1',
      500: '#627D98', // Base Brand Color
      600: '#486581',
      700: '#334E68',
      800: '#243B53',
      900: '#102A43',
    },
    // Action: Soft but clear Teal for "Go" / "Success"
    success: {
      100: '#E3F9E5',
      500: '#3EBD93',
      700: '#199473',
    },
    // Warning: Warm Amber, not aggressive Orange
    warning: {
      100: '#FFFBEA',
      500: '#FADB5F',
      700: '#CB9800', // Text readable on white
    },
    // Danger: Burnt Rose, not traffic light Red
    danger: {
      100: '#FFE3E3',
      500: '#E12D39',
      700: '#A61B1B',
    },
    // Neutrals: Warm Greys for reduced eye strain
    neutral: {
      0: '#FFFFFF',
      50: '#F7F9FA', // App Background
      100: '#E1E4E8', // Borders
      200: '#CFD7DE',
      300: '#9AA5B1', // Secondary Text
      400: '#7B8794',
      500: '#616E7C',
      600: '#52606D',
      700: '#3E4C59',
      800: '#323F4B', // Primary Text
      900: '#1F2933', // Headings
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    section: 64
  },
  borderRadius: {
    sm: 4,
    md: 8,  // Default card radius
    lg: 12, // Modal radius
    full: 9999
  },
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    // Fluid type scale
    sizes: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem',   // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem',  // 20px
      h3: '1.5rem',   // 24px
      h2: '2rem',     // 32px
      h1: '2.5rem',   // 40px
    }
  },
  shadows: {
    card: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
    cardHover: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
    modal: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
  }
};