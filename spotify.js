require('dotenv').config();
const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
// rest of your code...
const REDIRECT_URI = 'http://localhost:8888/callback';
const scopes = 'user-library-read';

let access_token = null;

app.get('/login', (req, res) => {
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + SPOTIFY_CLIENT_ID +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(REDIRECT_URI));
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const { data } = await axios({
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      data: qs.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: SPOTIFY_CLIENT_ID,
        password: SPOTIFY_CLIENT_SECRET
      }
    });

    access_token = data.access_token;
    res.send('Successfully authenticated, you can now visit /tracks');
  } catch (err) {
    console.error(err);
    res.send('Error getting access token');
  }
});

app.get('/tracks', async (req, res) => {
    if (!access_token) {
      res.send('Not authenticated, please visit /login');
      return;
    }
  
    let offset = 0;
    let tracks = [];
    let hasNextPage = true;
  
    while (hasNextPage) {
      try {
        const { data } = await axios({
          url: `https://api.spotify.com/v1/me/tracks?offset=${offset}`,
          method: 'get',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept':'application/json',
            'Content-Type': 'application/json'
          }
        });
  
        tracks = [...tracks, ...data.items.map(item => item.track.name)];
  
        hasNextPage = data.next !== null;
        offset += data.limit;
      } catch (err) {
        console.error(err);
        res.send('Error getting tracks');
        return;
      }
    }
  
    res.send(tracks);
  });

app.listen(8888);