"use client";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false, // Optional: common in Next.js to avoid unnecessary refetches
      // You can add more defaults like cacheTime, etc.
    },
    mutations: {
      // Optional mutation defaults
    },
  },
});
