import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { initializeDb, closeDb } from './config/db.js';
import { logger } from './config/logger.js';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import eventsRoutes from './routes/events.routes.js';
import marketsRoutes from './routes/markets.routes.js';
import newsRoutes from './routes/news.routes.js';

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.isDevelopment ? '*' : [env.api_base_url],
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
app.use('/api/events', optionalAuthMiddleware, eventsRoutes);
app.use('/api/markets', optionalAuthMiddleware, marketsRoutes);
app.use('/api/news', optionalAuthMiddleware, newsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
async function gracefulShutdown(): Promise<void> {
  logger.info('Graceful shutdown initiated');
  try {
    await closeDb();
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
      await initializeDb();
    } catch (dbError) {
      logger.warn('Database connection failed, running in mock mode', { dbError });
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
