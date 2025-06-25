/**
 * route.ts
 * 
 * Source file for Chronicle Weaver application.
 * 
 * Purpose: Implements functionality for route.
 * 
 * References:
 * - File: backend/trpc/routes/example/hi/route.ts
 * - Part of Chronicle Weaver application
 */

import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ name: z.string() }))
  .query(({ input }) => {
    return {
      hello: input.name,
      date: new Date(),
    };
  });