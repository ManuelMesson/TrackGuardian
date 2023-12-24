import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import LikedTracks from './LikedTracks';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8888/isLoggedIn')
      .then(response => response.json())
      .then(data => {
        setIsLoggedIn(data.isLoggedIn);
        console.log(data);
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const handleLogin = () => {
    window.location = 'http://localhost:8888/login';
  };

  if (isLoggedIn) {
    return <LikedTracks />;
  }

  return (
    <Container>
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Button variant="contained" color="primary" onClick={handleLogin} fullWidth>
            Login
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;