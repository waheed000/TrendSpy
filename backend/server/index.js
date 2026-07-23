import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { authMiddleware } from '../middleware/auth.js';
import productRoutes from '../routes/products.js';
import authRoutes from '../routes/auth.js';
import adRoutes from '../routes/ads.js';
import alertRoutes from '../routes/alerts.js';
import aiRoutes from '../routes/ai.js';
import notificationRoutes from '../routes/notifications.js';
import userRoutes from '../routes/user.js';
import dashboardRoutes from '../routes/dashboard.js';
import scraperRoutes from '../routes/scraper.js';
import exportRoutes from '../routes/export.js';
import statsRoutes from '../routes/stats.js';
import tiktokRoutes from '../routes/tiktok.js';
import internationalRoutes from '../routes/international.js';
import supplierRoutes from '../routes/suppliers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Create HTTP server ──────────────────────────────────────────────
const httpServer = createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5000'
].filter(Boolean);

// ── Socket.io ──────────────────────────────────────────────────────
const io = new Server(httpServer, {
  path: '/socket.io',
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
});

// Socket events
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on('authenticate', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`🔐 User ${userId} joined room`);
    }
  });

  socket.on('subscribe', (productId) => {
    if (productId) {
      socket.join(`product_${productId}`);
      console.log(`📦 Subscribed to product: ${productId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ── Export io for other services ──────────────────────────────────
export { io };

// ── Express Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/tiktok', tiktokRoutes);
app.use('/api/international', internationalRoutes);
app.use('/api/suppliers', supplierRoutes);

// ── Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB();
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server + Socket running on port ${PORT}`);
      console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔌 Socket.io path: /socket.io`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

export default app;