// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createSpotifyUserApi } = require('./spotifyApi');
const { constructAuthUrl, fetchAccessToken } = require('./auth');
const { trackCache, songsInPlaylistsCache } = require('./cache');

const app = express();
app.use(cors());

let accessToken = null;

app.get('/login', (req, res) => {
  res.redirect(constructAuthUrl());
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Error: Missing authorization code');
  }

  try {
    accessToken = await fetchAccessToken(code);
    res.redirect('http://localhost:3000');
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).send('Error getting access token');
  }
});

app.get('/tracks', async (req, res) => {
  if (!accessToken) {
    return res.status(401).send('Not authenticated, please visit /login');
  }

  const page = parseInt(req.query.page) || 0;
  const cacheKey = `tracks_${page}`;
  const cachedTracks = trackCache.get(cacheKey);
  if (cachedTracks) {
    return res.json({ tracks: cachedTracks, nextPage: page + 1, fromCache: true });
  }

  try {
    const spotifyUserApi = createSpotifyUserApi(accessToken);
    const offset = page * 20; // Assuming a default page size of 20
    const response = await spotifyUserApi.get(`/me/tracks?limit=20&offset=${offset}`);
    const tracks = response.data.items.map(item => item.track);
    const hasNextPage = response.data.next !== null;

    trackCache.set(cacheKey, tracks);
    res.json({ tracks, nextPage: hasNextPage ? page + 1 : null, fromCache: false });
  } catch (error) {
    console.error('Error getting tracks:', error);
    res.status(500).send('Error getting tracks');
  }
});

app.get('/logout', (req, res) => {
  accessToken = null;
  res.send('Successfully logged out, you can now visit /login');
});

app.get('/isLoggedIn', async (req, res) => {
  if (!accessToken) {
    return res.json({ isLoggedIn: false });
  }

  try {
    const spotifyUserApi = createSpotifyUserApi(accessToken);
    await spotifyUserApi.get('/me');
    res.json({ isLoggedIn: true });
  } catch (error) {
    res.json({ isLoggedIn: false });
  }
});

app.get('/allPlaylistSongs', async (req, res) => {
  try {
    if (!accessToken) {
      return res.status(401).send('Not authenticated, please visit /login');
    }

    const spotifyUserApi = createSpotifyUserApi(accessToken);
    const response = await spotifyUserApi.get('/me/playlists');
    const playlists = response.data.items;
    let allPlaylistSongs = [];

    for (const playlist of playlists) {
      if (playlist.name !== 'Liked Songs') {
        const tracksResponse = await spotifyUserApi.get(`/playlists/${playlist.id}/tracks`);
        const playlistSongs = tracksResponse.data.items.map(item => item.track);
        allPlaylistSongs = [...allPlaylistSongs, ...playlistSongs];
      }
    }

    res.json({ allPlaylistSongs });
  } catch (error) {
    console.error('Error getting all playlist songs:', error);
    res.status(500).send('Error getting all playlist songs');
  }
});

const verifyTracksInPlaylists = async (page = 0) => {
  const spotifyUserApi = createSpotifyUserApi(accessToken);
  const offset = page * 20; // Assuming a default page size of 20
  const playlistsResponse = await spotifyUserApi.get(`/me/playlists?limit=20&offset=${offset}`);
  const playlists = playlistsResponse.data.items;

  const tracksResponse = await spotifyUserApi.get('/me/tracks');
  const tracks = tracksResponse.data.items.map(item => item.track);

  let songsInPlaylists = [];

  for (const track of tracks) {
    for (const playlist of playlists) {
      if (playlist.name !== 'Liked Songs') {
        const playlistTracksResponse = await spotifyUserApi.get(`/playlists/${playlist.id}/tracks`);
        const playlistSongs = playlistTracksResponse.data.items.map(item => item.track);
        const songInPlaylist = playlistSongs.find(song => song.id === track.id);

        if (songInPlaylist) {
          songsInPlaylists.push({
            songName: track.name,
            artist: track.artists[0].name,
            playlistName: playlist.name
          });
        }
      }
    }
  }

  return { songsInPlaylists, hasNextPage: playlistsResponse.data.next !== null };
};

app.get('/songsInPlaylists', async (req, res) => {
  if (!accessToken) {
    return res.status(401).send('Not authenticated, please visit /login');
  }

  const page = parseInt(req.query.page) || 0;
  const cacheKey = `songsInPlaylists_${page}`;
  const cachedSongsInPlaylists = songsInPlaylistsCache.get(cacheKey);
  if (cachedSongsInPlaylists) {
    return res.json({ ...cachedSongsInPlaylists, fromCache: true });
  }

  try {
    const { songsInPlaylists, hasNextPage } = await verifyTracksInPlaylists(page);
    songsInPlaylistsCache.set(cacheKey, { songsInPlaylists, nextPage: hasNextPage ? page + 1 : null });
    res.json({ songsInPlaylists, nextPage: hasNextPage ? page + 1 : null, fromCache: false });
  } catch (error) {
    console.error('Error verifying songs in playlists:', error);
    res.status(500).send('Error verifying songs in playlists');
  }
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));