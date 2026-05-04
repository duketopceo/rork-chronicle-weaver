// Type stubs for firebase-admin subpath imports used by backend/trpc files.
// The actual runtime code runs in backend/functions which has its own node_modules.
// These stubs satisfy the root TypeScript compiler when it resolves the backend files
// transitively imported via src/lib/trpc.ts -> backend/trpc/app-router.ts.

declare module 'firebase-admin/auth' {
  export function getAuth(): any;
}

declare module 'firebase-admin/firestore' {
  export function getFirestore(): any;
}

declare module 'firebase-admin/app' {
  export function initializeApp(options?: any): any;
  export function getApps(): any[];
  export function cert(options: any): any;
}
