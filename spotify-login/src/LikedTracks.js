import React, { useState, useEffect } from 'react';
import { CircularProgress, List, ListItem, Typography, Container, Box } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

const LikedTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8888/tracks')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setTracks(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setError(error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="error">
          An error occurred: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h2" align="center" gutterBottom>
        Liked Tracks
      </Typography>
      <List>
        {tracks.map((track, index) => (
          <ListItem key={index}>
            <Typography variant="body1">{track}</Typography>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default LikedTracks;