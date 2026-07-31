import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#352f44',
      light: '#5c5470',
      dark: '#2a2438',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5c5470',
      light: '#dbd8e3',
      dark: '#2a2438',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f0edf7',
      paper: '#ffffff',
    },
    text: {
      primary: '#2a2438',
      secondary: '#5c5470',
      disabled: 'rgba(42,36,56,0.45)',
    },
    divider: 'rgba(42,36,56,0.12)',
    action: {
      hover: 'rgba(53,47,68,0.06)',
      selected: 'rgba(53,47,68,0.1)',
      disabled: 'rgba(42,36,56,0.35)',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    info: {
      main: '#2196f3',
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
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#352f44',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(42,36,56,0.12)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            borderLeft: '2px solid #352f44',
            backgroundColor: 'rgba(53,47,68,0.08)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(53,47,68,0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#5c5470',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#352f44',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(42,36,56,0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(42,36,56,0.1)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(53,47,68,0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(53,47,68,0.08)',
        },
      },
    },
  },
});
