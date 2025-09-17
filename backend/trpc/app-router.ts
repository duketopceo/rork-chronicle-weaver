import { router } from './create-context';
import { exampleRouter } from './routes/example/hi/route';

/**
 * Main tRPC router for Chronicle Weaver
 * This is the main router where all other routers are merged
 */
export const appRouter = router({
  example: exampleRouter,
});

// Export type router for type safety on client
export type AppRouter = typeof appRouter;
