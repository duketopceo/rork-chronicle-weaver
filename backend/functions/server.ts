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
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.ts:21',message:'Firebase init start',data:{hasProjectId:!!process.env.FIREBASE_PROJECT_ID,hasClientEmail:!!process.env.FIREBASE_CLIENT_EMAIL,hasPrivateKey:!!process.env.FIREBASE_PRIVATE_KEY,privateKeyLength:process.env.FIREBASE_PRIVATE_KEY?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.ts:25',message:'Firebase private key processed',data:{hasPrivateKey:!!privateKey,keyStartsWith:privateKey?.substring(0,30),keyLength:privateKey?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.ts:33',message:'Firebase init success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.ts:36',message:'Firebase init failed',data:{error:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    process.exit(1);
  }
}

// Import Hono apps
import { api } from './hono';
import aiHandler from './ai-handler';

// #region agent log
fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.ts:38',message:'Importing modules',data:{hasApi:!!api,hasAiHandler:!!aiHandler},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
// #endregion

// Create main server app
const app = api;

// Mount AI handler at /ai path
app.route('/ai', aiHandler);

// #region agent log
fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.ts:46',message:'AI handler mounted',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
// #endregion

// Get port from environment or default to 8080
const port = parseInt(process.env.PORT || '8080', 10);
// #region agent log
fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.ts:50',message:'Port configured',data:{port,portEnv:process.env.PORT},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
// #endregion

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
