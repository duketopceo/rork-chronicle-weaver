import { z } from 'zod';
import { router, publicProcedure } from '../../../create-context';

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name}!`,
      };
    }),
  
  getAll: publicProcedure
    .query(() => {
      return {
        message: 'All data retrieved successfully',
        data: [],
      };
    }),
});
