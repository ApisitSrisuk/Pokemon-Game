// src/theme/theme.js
import { createTheme, responsiveFontSizes } from '@mui/material/styles'; // Import responsiveFontSizes

let theme = createTheme({
  palette: {
    mode: 'dark', // หรือ 'light' ถ้าคุณชอบ UI แบบสว่าง
    primary: {
      main: '#FFCB05', // Pikachu yellow - เหมาะกับ Pokemon
      light: '#FFEA80',
      dark: '#CC9D00',
      contrastText: '#000000',
    },
    secondary: {
      main: '#3D7DCA', // Blastoise blue - สีรอง
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
      default: '#121212', // Dark background
      paper: '#1E1E1E',   // Slightly lighter dark for cards
      darker: '#0A0A0A', // Even darker for gradients (custom, ensure use in components)
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#757575',
      light: '#FFFFFF', // เพิ่มสี text.light สำหรับ ContrastText (ถ้ามี use case เฉพาะ)
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
    fontFamily: ['"Press Start 2P"', 'monospace'].join(','), // แนะนำให้เพิ่ม font นี้เพื่อความ Retro
    // Define base font sizes. responsiveFontSizes will handle scaling.
    h1: { fontSize: '4.5rem' },
    h2: { fontSize: '3.5rem' },
    h3: { fontSize: '2.8rem' },
    h4: { fontSize: '2.2rem' },
    h5: { fontSize: '1.6rem' },
    h6: { fontSize: '1.2rem' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem' },
    button: { fontSize: '0.875rem' },
    overline: { fontSize: '0.75rem' },
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
          backgroundColor: '#303030', // สีเข้มสำหรับ AppBar
          // Add responsive height/padding if needed directly in AppBar component
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
          borderRadius: '8px',
          boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 10px 2px rgba(0, 0, 0, .4)',
          },
          // Responsive padding/font size can be applied here globally if desired
          // For example:
          // padding: '8px 16px', // Default
          // '@media (max-width:600px)': {
          //   padding: '6px 12px', // Smaller on small screens
          //   fontSize: '0.75rem',
          // },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          // Responsive dimensions for cards are usually handled in the component itself
          // based on Grid system or specific sizing props, not globally here.
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
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