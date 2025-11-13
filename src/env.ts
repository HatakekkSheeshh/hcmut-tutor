/**
 * Environment detection
 */

declare const process: {
  env: {
    NODE_ENV: string;
    MODE: string;
  }
};

// For Vercel, check if we're on a production domain
const isProduction = typeof window !== 'undefined' 
  ? window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  : false;

export const API_BASE_URL = isProduction ? '/api' : 'http://localhost:3000/api';

// WebSocket URL - use same origin as API
export const WEBSOCKET_URL = isProduction 
  ? (typeof window !== 'undefined' ? `wss://${window.location.hostname}` : 'wss://localhost')
  : 'ws://localhost:3000';

