/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Surface
        'surface': '#f9f9ff',
        'surface-dim': '#d3daea',
        'surface-bright': '#f9f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f0f3ff',
        'surface-container': '#e7eefe',
        'surface-container-high': '#e2e8f8',
        'surface-container-highest': '#dce2f3',
        'on-surface': '#151c27',
        'on-surface-variant': '#434655',
        'inverse-surface': '#2a313d',
        'inverse-on-surface': '#ebf1ff',
        'surface-variant': '#dce2f3',
        'surface-tint': '#0053db',

        // Outline
        'outline': '#737686',
        'outline-variant': '#c3c6d7',

        // Primary
        'primary': '#004ac6',
        'on-primary': '#ffffff',
        'primary-container': '#2563eb',
        'on-primary-container': '#eeefff',
        'primary-fixed': '#dbe1ff',
        'primary-fixed-dim': '#b4c5ff',
        'on-primary-fixed': '#00174b',
        'on-primary-fixed-variant': '#003ea8',
        'inverse-primary': '#b4c5ff',

        // Secondary
        'secondary': '#712ae2',
        'on-secondary': '#ffffff',
        'secondary-container': '#8a4cfc',
        'on-secondary-container': '#fffbff',
        'secondary-fixed': '#eaddff',
        'secondary-fixed-dim': '#d2bbff',
        'on-secondary-fixed': '#25005a',
        'on-secondary-fixed-variant': '#5a00c6',

        // Tertiary
        'tertiary': '#943700',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#bc4800',
        'on-tertiary-container': '#ffede6',
        'tertiary-fixed': '#ffdbcd',
        'tertiary-fixed-dim': '#ffb596',
        'on-tertiary-fixed': '#360f00',
        'on-tertiary-fixed-variant': '#7d2d00',

        // Error
        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Background
        'background': '#f9f9ff',
        'on-background': '#151c27',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        gutter: '24px',
        unit: '4px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '60px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'title-lg': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '12px', letterSpacing: '0.03em', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
  // Safelist warna yang dipakai dinamis
  safelist: [
    'bg-secondary-container',
    'text-on-secondary-container',
    'bg-primary-fixed',
    'text-primary',
    'bg-secondary-fixed',
    'text-secondary',
    'bg-tertiary-fixed',
    'text-on-tertiary-fixed-variant',
    'bg-error-container',
    'text-error',
    'bg-surface-container-highest',
    'text-outline',
    'text-on-surface-variant',
    'bg-surface-container-high',
    'bg-surface-container-low',
    'border-outline-variant',
    'border-primary-container',
    'bg-primary-container',
    'text-on-primary-container',
  ],
}