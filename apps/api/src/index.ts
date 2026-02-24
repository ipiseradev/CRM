import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.handler';
import { setupSwagger } from './config/swagger';

import authRoutes from './routes/auth.routes';
import clientsRoutes from './routes/clients.routes';
import dealsRoutes from './routes/deals.routes';
import tasksRoutes from './routes/tasks.routes';
import activitiesRoutes from './routes/activities.routes';
import metricsRoutes from './routes/metrics.routes';

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: { message: 'Too many requests, please try again later.', code: 'RATE_LIMIT' },
  },
});
app.use(limiter);

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───────────────────────────────────────────────────────────────────
app.use(loggerMiddleware);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'SalesCore API',
    },
  });
});

// Root helpers for production hosting (e.g. Vercel custom domains)
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    data: {
      service: 'SalesCore API',
      status: 'online',
      docs: env.NODE_ENV !== 'production' ? '/docs' : null,
      health: '/health',
      basePath: '/api',
    },
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    ok: true,
    data: {
      message: 'SalesCore API base path',
      health: '/health',
      routes: [
        '/api/auth',
        '/api/clients',
        '/api/deals',
        '/api/tasks',
        '/api/activities',
        '/api/metrics',
      ],
    },
  });
});

// ─── Swagger Documentation (dev only) ────────────────────────────────────────
if (env.NODE_ENV !== 'production') {
  setupSwagger(app);
}

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/metrics', metricsRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
  console.log(`\n🚀 SalesCore API running on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   CORS Origin: ${env.CORS_ORIGIN}\n`);
});

// ─── Graceful Shutdown ─────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default app;
