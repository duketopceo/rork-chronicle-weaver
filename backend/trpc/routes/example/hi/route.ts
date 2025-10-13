// DEPRECATED: Legacy example route
// This router is no longer used in V1. It remains as a stub to avoid import errors.
// Do not reference this route in production code.

import { z } from 'zod';
import { router, publicProcedure } from '../../../create-context';

export const exampleRouter = router({
  status: publicProcedure
    .query(() => ({
      deprecated: true,
      message: 'This route is deprecated and not used in V1',
    })),
});
