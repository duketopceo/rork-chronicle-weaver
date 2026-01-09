/**
 * Chronicle Weaver - Standalone Server Entry Point
 * 
 * Docker-ready standalone server for Mac mini cluster deployment.
 * Runs the Hono API server and AI handler using @hono/node-server.
 * 
 * Features:
 * - Standalone Node.js server (not Firebase Functions)
 * - Firebase Admin SDK initialization
 * - Graceful shutdown handling
 * - Health check endpoints
 * - Main API and AI handler routes
 * 
 * Last Updated: January 2025
 */

import { serve } from '@hono/node-server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK for standalone use
if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    process.exit(1);
  }
}

// Import Hono apps
import { api } from './hono';
import aiHandler from './ai-handler';

// Create main server app
const app = api;

// Mount AI handler at /ai path
app.route('/ai', aiHandler);

// Get port from environment or default to 8080
const port = parseInt(process.env.PORT || '8080', 10);

// Start server
const server = serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`🚀 Chronicle Weaver Backend Server`);
  console.log(`📡 Listening on http://localhost:${info.port}`);
  console.log(`📊 Health check: http://localhost:${info.port}/health`);
  console.log(`🤖 AI Handler: http://localhost:${info.port}/ai/health`);
  console.log(`🔗 API: http://localhost:${info.port}/api/trpc`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

export default app;
