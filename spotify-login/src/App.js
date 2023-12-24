import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import LikedTracks from './LikedTracks';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from 'react-query';

const theme = createTheme({
  zIndex: {
    drawer: 1200,
  },
});

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:8888/isLoggedIn');
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        setError(error.message);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = () => {
    window.location = 'http://localhost:8888/login';
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
          <Grid item xs={12} sm={8} md={6} lg={4}>
            {isLoggedIn ? <QueryClientProvider client={queryClient}>
              <LikedTracks />
            </QueryClientProvider> : (
              <Button variant="contained" color="primary" onClick={handleLogin} fullWidth>
                Login
              </Button>
            )}
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default App;