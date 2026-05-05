import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import routes from './routes';
import { AuthProvider } from './context/AuthContext';
import '@fontsource/tinos'; // Import Tinos font

// Create a custom theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e6aa5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Tinos", "Times New Roman", serif',
    h1: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    h2: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    h3: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    h4: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    h5: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    h6: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    subtitle1: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    subtitle2: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    body1: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    body2: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    button: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    caption: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
    overline: {
      fontFamily: '"Tinos", "Times New Roman", serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// Create router from route configuration
const router = createBrowserRouter(routes);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;