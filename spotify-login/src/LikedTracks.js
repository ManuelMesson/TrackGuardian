import React, { useState, useEffect } from 'react';
import { CircularProgress, List, ListItem, Typography, Container, Box, Grid } from '@mui/material';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/system';

const StyledListItem = styled(ListItem)({
  backgroundColor: '#f5f5f5',
  margin: '10px 0',
  borderRadius: '5px',
});

const LikedTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('http://localhost:8888/tracks');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTracks(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, []);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Container>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={8} md={6}>
          <Box sx={{ color: '#3f51b5' }}>
            <Typography variant="h4" gutterBottom>Liked Tracks</Typography>
            <List>
              {tracks.map((track, index) => (
                <StyledListItem key={index}>
                  <Typography variant="body1">{track.name}</Typography>
                </StyledListItem>
              ))}
            </List>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LikedTracks;