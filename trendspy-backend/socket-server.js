/**
 * TrendSpy Socket.io Server
 * Standalone Express + Socket.io server on port 3002.
 * Handles real-time product score updates and user alerts.
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const httpServer = createServer(app);

const SOCKET_PORT = parseInt(process.env.SOCKET_PORT || '3002', 10);
const SOCKET_SECRET = process.env.SOCKET_INTERNAL_SECRET || 'trendspy-socket-internal';

// In-memory map: socketId → { userId, socketId, connectedAt }
const connectedUsers = new Map();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ─── Authentication Middleware ───────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.email  = decoded.email;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

// ─── Connection Handlers ─────────────────────────────────────────────────────
io.on('connection', (socket) => {
  connectedUsers.set(socket.id, {
    userId:      socket.userId,
    socketId:    socket.id,
    connectedAt: new Date(),
  });

  console.log(`[Socket] Connected: userId=${socket.userId} socketId=${socket.id} total=${connectedUsers.size}`);

  socket.join(`user:${socket.userId}`);

  socket.on('subscribe', ({ productIds = [] }) => {
    productIds.forEach((id) => socket.join(`product:${id}`));
    console.log(`[Socket] userId=${socket.userId} subscribed to ${productIds.length} product(s)`);
  });

  socket.on('unsubscribe', ({ productIds = [] }) => {
    productIds.forEach((id) => socket.leave(`product:${id}`));
  });

  socket.on('disconnect', (reason) => {
    connectedUsers.delete(socket.id);
    console.log(`[Socket] Disconnected: userId=${socket.userId} reason=${reason} total=${connectedUsers.size}`);
  });
});

// ─── Internal Emit API ───────────────────────────────────────────────────────
// Called by Next.js process via HTTP to emit socket events without sharing state
app.post('/internal/emit', (req, res) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== SOCKET_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { event, data, userId, productId } = req.body;

  if (!event) {
    return res.status(400).json({ error: 'event is required' });
  }

  if (userId) {
    io.to(`user:${userId}`).emit(event, data);
  } else if (productId) {
    io.to(`product:${productId}`).emit(event, data);
  } else {
    io.emit(event, data);
  }

  res.json({ success: true, connectedClients: io.engine.clientsCount });
});

// ─── Status Endpoint ─────────────────────────────────────────────────────────
app.get('/socket/status', (req, res) => {
  res.json({
    status:    'online',
    clients:   io.engine.clientsCount,
    users:     connectedUsers.size,
    uptime:    process.uptime(),
  });
});

// ─── Exported Helpers (same process use) ─────────────────────────────────────
export function emitToUser(userId, event, data) {
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToAll(event, data) {
  io.emit(event, data);
}

export function getConnectedUsers() {
  return connectedUsers.size;
}

// ─── Start ───────────────────────────────────────────────────────────────────
httpServer.listen(SOCKET_PORT, '0.0.0.0', () => {
  console.log(`[Socket] Server running on port ${SOCKET_PORT}`);
});

export default io;
