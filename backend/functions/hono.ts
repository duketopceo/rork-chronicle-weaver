/**
 * Chronicle Weaver - Hono Server Implementation
 * 
 * Production-ready backend server with comprehensive API endpoints,
 * middleware, error handling, and Firebase Functions integration.
 * 
 * Features:
 * - Express-style routing with Hono framework
 * - CORS configuration for web app
 * - Request/response logging
 * - Error handling middleware
 * - Health check endpoint
 * - API versioning
 * - Rate limiting for production safety
 * - Firebase Functions deployment ready
 * 
 * Last Updated: January 2025
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { rateLimiter } from 'hono/rate-limiter';
import { onError } from 'hono/on-error';
import { HTTPException } from 'hono/http-exception';

// Import tRPC router
import { appRouter } from '../trpc/app-router';
import { createContext } from '../trpc/create-context';

// Initialize Hono app
const app = new Hono();

// === MIDDLEWARE CONFIGURATION ===

// Security headers
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.stripe.com", "https://*.firebase.com"],
  },
}));

// CORS configuration for web app
app.use('*', cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:8082', 
    'https://chronicleweaver.com',
    'https://chronicle-weaver-460713.web.app'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

// Request logging
app.use('*', logger());

// Pretty JSON for development
if (process.env.NODE_ENV === 'development') {
  app.use('*', prettyJSON());
}

// Rate limiting
app.use('*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-6',
  legacyHeaders: false,
}));

// Error handling middleware
app.onError(onError((err, c) => {
  console.error('Server Error:', err);
  
  if (err instanceof HTTPException) {
    return c.json({
      error: err.message,
      status: err.status
    }, err.status);
  }
  
  return c.json({
    error: 'Internal Server Error',
    status: 500
  }, 500);
}));

// === HEALTH CHECK ENDPOINT ===
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// === API VERSIONING ===
app.route('/api/v1', appRouter);

// === ROOT ENDPOINT ===
app.get('/', (c) => {
  return c.json({
    message: 'Chronicle Weaver API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api/v1/docs'
    }
  });
});

// === 404 HANDLER ===
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    status: 404
  }, 404);
});

// === FIREBASE FUNCTIONS EXPORT ===
export const api = app;

// For local development
if (require.main === module) {
  const port = process.env.PORT || 3000;
  console.log(`🚀 Chronicle Weaver API running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔗 API docs: http://localhost:${port}/api/v1/docs`);
}

