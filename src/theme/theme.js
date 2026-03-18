// src/theme/theme.js
import { createTheme, responsiveFontSizes } from '@mui/material/styles'; // Import responsiveFontSizes

const themeBackground = 'rgba(18, 18, 18, 0.8)';
const glassBackground = 'rgba(30, 30, 30, 0.6)';

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFCB05', // Pikachu yellow
      light: '#FFEA80',
      dark: '#CC9D00',
      contrastText: '#000000',
    },
    secondary: {
      main: '#3D7DCA', // Blastoise blue
      light: '#6FA8DE',
      dark: '#2A5C97',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC0A2D', // Red for danger/fainted
      light: '#EF4444',
      dark: '#A00821',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#228B22', // Green for healthy/win
      light: '#4CAF50',
      dark: '#1C6D1C',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFC107', // Orange for warnings
      light: '#FFD700',
      dark: '#E0A800',
      contrastText: '#000000',
    },
    info: {
      main: '#2196F3', // Blue for info
      light: '#64B5F6',
      dark: '#1976D2',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0a0a0b', // Deep dark
      paper: '#1a1a1c',   // Card background
    },
    text: {
      primary: '#f8f9fa',
      secondary: '#adb5bd',
      disabled: '#6c757d',
    },
    pokemonType: {
      normal: { main: '#A8A77A', text: '#FFFFFF' },
      fire: { main: '#EE8130', text: '#FFFFFF' },
      water: { main: '#6390F0', text: '#FFFFFF' },
      electric: { main: '#F7D02C', text: '#000000' },
      grass: { main: '#7AC74C', text: '#FFFFFF' },
      ice: { main: '#96D9D6', text: '#000000' },
      fighting: { main: '#C22E28', text: '#FFFFFF' },
      poison: { main: '#A33EA1', text: '#FFFFFF' },
      ground: { main: '#E2BF65', text: '#000000' },
      flying: { main: '#A98FF3', text: '#FFFFFF' },
      psychic: { main: '#F95587', text: '#FFFFFF' },
      bug: { main: '#A6B91A', text: '#FFFFFF' },
      rock: { main: '#B6A136', text: '#FFFFFF' },
      ghost: { main: '#735797', text: '#FFFFFF' },
      dragon: { main: '#6F35FC', text: '#FFFFFF' },
      steel: { main: '#B7B7CE', text: '#000000' },
      fairy: { main: '#D685AD', text: '#FFFFFF' },
      dark: { main: '#705746', text: '#FFFFFF' },
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  // Define breakpoints explicitly if you need to customize them
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '8px 20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: '0 8px 20px rgba(255, 203, 5, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
          backgroundColor: glassBackground,
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          overflow: 'hidden',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
          backgroundColor: glassBackground,
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiSelect-select': {
            padding: '10px 14px',
            // Responsive padding/font size for select
            // '@media (max-width:600px)': {
            //   padding: '8px 12px',
            //   fontSize: '0.8rem',
            // },
          },
        },
      },
    },
    // Add overrides for Dialog component if you want global responsive behavior
    MuiDialog: {
      styleOverrides: {
        paper: {
          // Default styling for all Dialog Paper components
          // Can be overridden by component-specific styles
          borderRadius: '12px',
          // Example of responsive padding:
          // padding: { xs: '16px', sm: '24px' },
        },
      },
    },
  },
});

// Use responsiveFontSizes to automatically adjust font sizes based on screen size
theme = responsiveFontSizes(theme);

export default theme;