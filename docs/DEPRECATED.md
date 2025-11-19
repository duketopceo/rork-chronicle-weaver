# Deprecated Components and Routes

This file tracks legacy components and routes that are preserved temporarily for backward compatibility but are NOT used in V1. They will be removed after the transition period.

Deprecated items:

- `backend/trpc/routes/example/hi/route.ts` — legacy example router; returns a deprecation status only.

Policy:

- Do not add new references to deprecated files.
- Replace usages with the V1 implementations (Hono + tRPC routes under `backend/trpc` and app screens under `src/app`).
- Remove these files once all deployments are confirmed on V1.


