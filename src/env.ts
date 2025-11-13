/**
 * Environment detection
 * 
 * Note: In Vite, use import.meta.env instead of process.env for client-side code
 * Type definitions are in src/vite-env.d.ts
 */

// For Vercel, check if we're on a production domain
const isProduction = typeof window !== 'undefined' 
  ? window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  : false;

export const API_BASE_URL = isProduction ? '/api' : 'http://localhost:3000/api';

// WebSocket URL - use separate WebSocket server (Railway/Render)
// In production, this should point to your WebSocket server URL
// Example: wss://your-ws-server.railway.app
// 
// Note: Vite exposes env variables prefixed with VITE_ via import.meta.env
export const WEBSOCKET_URL = isProduction 
  ? (import.meta.env.VITE_WEBSOCKET_URL || (typeof window !== 'undefined' ? `wss://${window.location.hostname.replace('vercel.app', 'railway.app')}` : 'wss://localhost'))
  : (import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001');

