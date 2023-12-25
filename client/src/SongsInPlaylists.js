// client/src/SongsInPlaylists.js
import React, { useState } from 'react';
import { CircularProgress, List, ListItem, Typography, Container, Box, Grid, Backdrop, Button } from '@mui/material';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/system';
import { useQuery, useQueryClient } from 'react-query';

const StyledListItem = styled(ListItem)({
  backgroundColor: '#f5f5f5',
  margin: '10px 0',
  borderRadius: '5px',
});

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  color: '#fff',
}));

const fetchSongsInPlaylists = async ({ queryKey }) => {
  const [_key, { page }] = queryKey;
  const response = await fetch(`http://localhost:8888/songsInPlaylists?page=${page}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  console.log('Fetched data:', data); // Debugging line
  return data;
};

const SongsInPlaylists = () => {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const {
    data,
    error,
    isLoading,
  } = useQuery(['songsInPlaylists', { page }], fetchSongsInPlaylists, { keepPreviousData: true });

  console.log('Render data:', data); // Debugging line

  const handleNextPage = () => {
    if (data.nextPage !== null) {
      setPage(old => old + 1);
    }
  };

  const handlePrevPage = () => {
    setPage(old => Math.max(old - 1, 0));
  };

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Container>
      <StyledBackdrop open={isLoading}>
        <CircularProgress color="inherit" />
      </StyledBackdrop>
      <Grid container justifyContent="center">
        <Grid item lg={12}>
          <Box sx={{ color: '#3f51b5' }}>
            <Typography variant="h4" gutterBottom>Songs in Playlists</Typography>
            <List>
              {data?.songsInPlaylists?.map((song, index) => (
                <StyledListItem key={index}>
                  <Typography variant="h6" gutterBottom>{song.songName}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">{`by ${song.artist}`}</Typography>
                  <Typography variant="subtitle2" color="textSecondary">{`in ${song.playlistName}`}</Typography>
                </StyledListItem>
              ))}
            </List>
            <Button disabled={page === 0} onClick={handlePrevPage}>Previous Page</Button>
            <Button disabled={data?.nextPage === null} onClick={handleNextPage}>Next Page</Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SongsInPlaylists;