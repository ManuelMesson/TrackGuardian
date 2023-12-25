// server/spotify.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const qs = require('qs');
const NodeCache = require('node-cache');
const trackCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const app = express();
app.use(cors());

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
const REDIRECT_URI = 'http://localhost:8888/callback';
const scopes = 'user-library-read';

let accessToken = null;

const spotifyApi = axios.create({
  baseURL: 'https://accounts.spotify.com',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

const constructAuthUrl = () => {
  const queryParams = qs.stringify({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: REDIRECT_URI
  });
  return `${spotifyApi.defaults.baseURL}/authorize?${queryParams}`;
};

const fetchAccessToken = async (code) => {
  const response = await spotifyApi.post('/api/token', qs.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI
  }), {
    auth: {
      username: SPOTIFY_CLIENT_ID,
      password: SPOTIFY_CLIENT_SECRET
    }
  });
  accessToken = response.data.access_token;
};

app.get('/login', (req, res) => {
  res.redirect(constructAuthUrl());
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Error: Missing authorization code');
  }

  try {
    await fetchAccessToken(code);
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
    const spotifyUserApi = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

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
    await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    res.json({ isLoggedIn: true });
  } catch (error) {
    res.json({ isLoggedIn: false });
  }
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));