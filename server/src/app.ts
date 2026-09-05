import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartOrderRoutes from './routes/cartOrderRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Core Middlewares
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Static uploads directory
  app.use('/uploads', express.static(uploadDir));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Yadman Backend API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Routers
  app.use('/api/auth', authRoutes);
  app.use('/api', productRoutes);
  app.use('/api', cartOrderRoutes);
  app.use('/api/blog', blogRoutes);
  app.use('/api', reviewRoutes);
  app.use('/api', inquiryRoutes);
  app.use('/api', cmsRoutes);
  app.use('/api', uploadRoutes);

  // Global Error Handler for API routes
  app.use('/api', errorHandler);

  return app;
}
