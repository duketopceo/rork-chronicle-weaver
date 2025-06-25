/**
 * app-router.ts
 * 
 * Source file for Chronicle Weaver application.
 * 
 * Purpose: Implements functionality for app-router.
 * 
 * References:
 * - File: backend/trpc/app-router.ts
 * - Part of Chronicle Weaver application
 */

import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
});

export type AppRouter = typeof appRouter;