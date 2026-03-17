import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#dbd8e3',
      dark: '#5c5470',
    },
    secondary: {
      main: '#5c5470',
      light: '#dbd8e3',
    },
    background: {
      default: '#2a2438',
      paper: '#352f44',
    },
    text: {
      primary: '#ffffff',
      secondary: '#dbd8e3',
    },
    divider: 'rgba(219,216,227,0.12)',
    action: {
      hover: 'rgba(219,216,227,0.06)',
      selected: 'rgba(219,216,227,0.12)',
    },
    success: {
      main: '#4ade80',
    },
    warning: {
      main: '#fb923c',
    },
    error: {
      main: '#f87171',
    },
    info: {
      main: '#60a5fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(42,36,56,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(219,216,227,0.08)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #2a2438 0%, #352f44 100%)',
          borderRight: '1px solid rgba(219,216,227,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(53,47,68,0.8)',
          border: '1px solid rgba(219,216,227,0.06)',
          borderRadius: 16,
          boxShadow: 'none',
          transition: 'border-color 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'rgba(219,216,227,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(219,216,227,0.1)',
            borderLeft: '2px solid #dbd8e3',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(219,216,227,0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(219,216,227,0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(219,216,227,0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#dbd8e3',
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: '#352f44',
          '&:hover': {
            backgroundColor: '#3d3752',
          },
          '&.Mui-selected': {
            backgroundColor: '#3d3752',
            '&:hover': {
              backgroundColor: '#443f5e',
            },
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#352f44',
          backgroundImage: 'none',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: '#dbd8e3',
        },
      },
    },
  },
});
