// spotify-login/src/LikedTracks.js
import React from 'react';
import { CircularProgress, List, ListItem, Typography, Container, Box, Grid, Backdrop } from '@mui/material';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/system';
import { useInfiniteQuery } from 'react-query';
import { useInView } from 'react-intersection-observer';

const StyledListItem = styled(ListItem)({
  backgroundColor: '#f5f5f5',
  margin: '10px 0',
  borderRadius: '5px',
});

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  color: '#fff',
}));

const fetchTracks = async ({ pageParam = 0 }) => {
  const response = await fetch(`http://localhost:8888/tracks?page=${pageParam}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const LikedTracks = () => {
  const [ref, inView] = useInView();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteQuery('tracks', fetchTracks, {
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

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
            <Typography variant="h4" gutterBottom>Liked Tracks</Typography>
            <List>
              {data?.pages?.map((page, i) => (
                page.tracks.map((track, index) => (
                  <StyledListItem ref={index === page.tracks.length - 1 ? ref : null} key={index}>
                    <Typography variant="h6" gutterBottom>{track.name}</Typography>
                    <Typography variant="subtitle1" color="textSecondary">{`by ${track.artists[0].name}`}</Typography>
                  </StyledListItem>
                ))
              ))}
            </List>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LikedTracks;