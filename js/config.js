export const API_CONFIG = {
  BASE_URL: 'https://iptv-org.github.io/api',
  ENDPOINTS: {
    CHANNELS: '/channels.json',
    STREAMS: '/streams.json', 
    GUIDES: '/guides.json',
    CATEGORIES: '/categories.json',
    LANGUAGES: '/languages.json',
    COUNTRIES: '/countries.json',
    SUBDIVISIONS: '/subdivisions.json',
    REGIONS: '/regions.json',
    BLOCKLIST: '/blocklist.json'
  },
  CACHE_DURATION: 1000 * 60 * 15 // 15 minutes
};

export const PLAYER_CONFIG = {
  HLS_CONFIG: {
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 90,
    maxBufferLength: 30
  }
};

export const DEFAULT_PLATFORM = {
  id: "all",
  name: "All Channels",
  channels: [] // Will be populated with all available channels
};