# WebSocket Server

WebSocket server riêng biệt cho real-time chat, chạy trên Railway/Render vì Vercel không hỗ trợ WebSocket persistent connections.

## Chạy local

```bash
# Từ root directory
npm run dev:ws

# Hoặc từ ws-server directory
cd ws-server
npm install
npm run dev
```

## Deploy lên Railway

1. Tạo Railway project
2. Connect GitHub repo
3. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `FRONTEND_URL=https://your-app.vercel.app`
   - `JWT_SECRET=<same-as-vercel>`
   - `BLOB_READ_WRITE_TOKEN=<if-using-blob-storage>`
4. Set start command: `npm run ws`
5. Lấy WebSocket URL và thêm vào Vercel: `VITE_WEBSOCKET_URL=wss://your-server.railway.app`

Xem chi tiết trong `docs/WEBSOCKET_SETUP.md`

