// cache.js
const NodeCache = require('node-cache');

const trackCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const songsInPlaylistsCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

module.exports = { trackCache, songsInPlaylistsCache };