/**
 * hono.ts
 * 
 * Source file for Chronicle Weaver application.
 * 
 * Purpose: Implements functionality for hono.
 * 
 * References:
 * - File: backend/functions/hono.ts
 * - Part of Chronicle Weaver application
 */

import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "../trpc/app-router";
import { createContext } from "../trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

// Ensure compatibility between `createTRPCRouter` and `trpcServer`
import { AppRouter } from "../trpc/app-router";

// Update the `trpcServer` configuration
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;