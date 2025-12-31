/**
 * trpc.ts
 * 
 * Source file for Chronicle Weaver application.
 * 
 * Purpose: Implements functionality for trpc.
 * 
 * References:
 * - File: src/lib/trpc.ts
 * - Part of Chronicle Weaver application
 */

import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import type { AppRouter } from "../../backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Always use Firebase Functions origin for API calls
  return 'https://us-central1-chronicle-weaver-460713.cloudfunctions.net';
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      // Add error handling for network issues
      fetch: (url, options) => {
        console.log('tRPC calling:', url);
        return fetch(url, options).catch(error => {
          console.error('tRPC fetch error:', error);
          throw error;
        });
      },
    }),
  ],
});

// Create vanilla tRPC client for use outside React components
export const trpcVanillaClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      fetch: (url, options) => {
        console.log('tRPC vanilla calling:', url);
        return fetch(url, options).catch(error => {
          console.error('tRPC vanilla fetch error:', error);
          throw error;
        });
      },
    }),
  ],
});