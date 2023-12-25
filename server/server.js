// server.js
const express = require('express');
const cors = require('cors');
const { spotifyApi, createSpotifyUserApi } = require('./spotifyApi');
const { constructAuthUrl, fetchAccessToken } = require('./auth');
const { trackCache, songsInPlaylistsCache } = require('./cache');
// ... rest of the code ...