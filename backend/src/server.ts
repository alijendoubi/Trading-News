import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { initializeFirebase, closeFirebase } from './config/firebase.js';
import { logger } from './config/logger.js';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { startCronJobs } from './cron/scheduler.js';
import authRoutes from './routes/auth.routes.js';
import eventsRoutes from './routes/events.routes.js';
import marketsRoutes from './routes/markets.routes.js';
import newsRoutes from './routes/news.routes.js';
import watchlistsRoutes from './routes/watchlists.routes.js';
import alertsRoutes from './routes/alerts.routes.js';
import indicatorsRoutes from './routes/indicators.routes.js';
import forumRoutes from './routes/forum.routes.js';
import blogRoutes from './routes/blog.routes.js';
import brokersRoutes from './routes/brokers.routes.js';

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.isDevelopment ? '*' : [
      'https://trading-o6t9x2bp1-alijendoubis-projects.vercel.app',
      'https://trading-b8uoyqk4v-alijendoubis-projects.vercel.app',
      /.*\.vercel\.app$/,  // Allow all Vercel preview deployments
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.http(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', optionalAuthMiddleware, eventsRoutes);
app.use('/api/markets', optionalAuthMiddleware, marketsRoutes);
app.use('/api/news', optionalAuthMiddleware, newsRoutes);
app.use('/api/indicators', optionalAuthMiddleware, indicatorsRoutes);
app.use('/api/watchlists', watchlistsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/forum', optionalAuthMiddleware, forumRoutes);
app.use('/api/blog', optionalAuthMiddleware, blogRoutes);
app.use('/api/brokers', optionalAuthMiddleware, brokersRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
async function gracefulShutdown(): Promise<void> {
  logger.info('Graceful shutdown initiated');
  try {
    await closeFirebase();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
async function start(): Promise<void> {
  try {
    try {
      initializeFirebase();
      logger.info('Firebase connected successfully');
    } catch (firebaseError) {
      logger.warn('Firebase connection failed, running in API-only mode (no database)', { firebaseError });
    }
    
    // Start cron jobs (they will handle errors gracefully)
    try {
      startCronJobs();
    } catch (cronError) {
      logger.warn('Cron jobs failed to start, continuing without background tasks', { cronError });
    }
    
    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} in ${env.node_env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

start();

export default app;
