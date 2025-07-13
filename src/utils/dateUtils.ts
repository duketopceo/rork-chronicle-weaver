/**
 * Date and Time Utilities
 * 
 * Utility functions for handling dates, times, and historical periods.
 * 
 * Purpose: Provides date formatting and manipulation for historical contexts.
 * 
 * References:
 * - File: src/utils/dateUtils.ts
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}