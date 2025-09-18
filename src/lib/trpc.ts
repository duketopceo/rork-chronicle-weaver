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
import { httpLink } from "@trpc/client";
import type { AppRouter } from "../../backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Use hardcoded production API URL
  return 'https://us-central1-chronicle-weaver-460713.cloudfunctions.net/api';
  if (typeof window !== 'undefined') {
    return window.location.origin; // Use current domain
  }
  
  // Final fallback for development
  return "http://localhost:3000";
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