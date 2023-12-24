// server/spotify.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const qs = require('qs');

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

  try {
    const spotifyUserApi = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    let offset = parseInt(req.query.page) * 20 || 0; // Assuming a default page size of 20
    let tracks = [];
    let hasNextPage = true;

    // Fetch only one page of results
    const response = await spotifyUserApi.get(`/me/tracks?limit=20&offset=${offset}`);
    tracks = response.data.items.map(item => item.track);
    hasNextPage = response.data.next !== null;

    res.json({ tracks, nextPage: hasNextPage ? offset / 20 + 1 : null });
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