import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "../../backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // Fallback for development or if env var is missing
  if (typeof window !== 'undefined') {
    return window.location.origin; // Use current domain
  }
  
  // Final fallback
  return "https://chronicleweaver.com";
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