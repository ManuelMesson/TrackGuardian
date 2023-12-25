// client/src/App.js
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import LikedTracks from './LikedTracks';
import SongsInPlaylists from './SongsInPlaylists';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from 'react-query';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const theme = createTheme({
  zIndex: {
    drawer: 1200,
  },
});

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

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

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
          <Grid item lg={12}>
            {isLoggedIn ? <QueryClientProvider client={queryClient}>
              <Tabs value={tab} onChange={handleChange} centered>
                <Tab label="Liked Tracks" />
                <Tab label="Songs in Playlists" />
              </Tabs>
              {tab === 0 && <LikedTracks />}
              {tab === 1 && <SongsInPlaylists />}
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