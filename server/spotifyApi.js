// spotifyApi.js
const axios = require('axios');
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

const spotifyApi = axios.create({
  baseURL: 'https://accounts.spotify.com',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

const createSpotifyUserApi = (accessToken) => {
  return axios.create({
    baseURL: 'https://api.spotify.com/v1',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
};

module.exports = { spotifyApi, createSpotifyUserApi };