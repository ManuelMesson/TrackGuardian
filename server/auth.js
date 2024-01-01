const qs = require('qs');
const { spotifyApi } = require('./spotifyApi');

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const scopes = 'user-library-read';

const constructAuthUrl = () => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    throw new Error('Missing Spotify Client ID or Redirect URI');
  }

  const queryParams = qs.stringify({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: SPOTIFY_REDIRECT_URI,
  });

  return `${spotifyApi.defaults.baseURL}/authorize?${queryParams}`;
};

const fetchAccessToken = async (code) => {
  if (!code) {
    throw new Error('Missing authorization code');
  }

  try {
    const response = await spotifyApi.post('/api/token', qs.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }), {
      auth: {
        username: SPOTIFY_CLIENT_ID,
        password: SPOTIFY_CLIENT_SECRET
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
};

module.exports = { constructAuthUrl, fetchAccessToken };