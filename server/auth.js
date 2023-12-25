// auth.js
const qs = require('qs');
const { spotifyApi } = require('./spotifyApi');
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI } = process.env;
const scopes = 'user-library-read';

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
  return response.data.access_token;
};

module.exports = { constructAuthUrl, fetchAccessToken };