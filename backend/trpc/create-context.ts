import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

/**
 * Context creation for tRPC
 * This creates a context for each request
 */
export const createTRPCContext = async () => {
  return {
    // Add any context data here (e.g., user session, database connection)
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause && error.code === 'BAD_REQUEST' && error.cause
            ? error.cause
            : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
