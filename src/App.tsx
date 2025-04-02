import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navigation from './components/Navigation';
import { useData } from './store/DataContext';

// Création du thème
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const App: React.FC = () => {
  const { data } = useData();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navigation />
    </ThemeProvider>
  );
};

export default App;
