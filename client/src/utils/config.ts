// utils/config.ts
export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5202/api',
    maxRetries: 3,
    taskLimit: 5,
} as const;