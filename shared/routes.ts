import { z } from 'zod';
import { insertUserPiStateSchema } from './schema.js';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  pi: {
    state: {
      method: 'GET' as const,
      path: '/api/pi/state',
      responses: {
        200: z.object({
          totalUsers: z.number(),
          lastRenderedAt: z.string().nullable(),
          currentDigitIndex: z.number(),
        }),
      },
    },
    myDigit: {
      method: 'GET' as const,
      path: '/api/pi/my-digit',
      responses: {
        200: z.object({
          digitIndex: z.number(),
          digitValue: z.number(),
          fromDigit: z.number().nullable(),
          toDigit: z.number(),
          chordNumber: z.number().nullable(),
          assignedAt: z.string(),
        }).nullable(), // Null if user has no digit yet (shouldn't happen if auto-assigned on signup)
        401: errorSchemas.unauthorized,
      },
    },
    assignDigit: { // Call this after signup if not done automatically
      method: 'POST' as const,
      path: '/api/pi/assign-digit',
      responses: {
        200: z.object({
          digitIndex: z.number(),
          digitValue: z.number(),
          fromDigit: z.number().nullable(),
          toDigit: z.number(),
          chordNumber: z.number().nullable(),
          assignedAt: z.string(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    wallpaper: {
      method: 'GET' as const,
      path: '/api/pi/wallpaper', // Returns URLs
      responses: {
        200: z.object({
          latest: z.string(),
          resolutions: z.record(z.string(), z.string()),
        }),
      },
    },
    timeline: {
      method: 'GET' as const,
      path: '/api/pi/timeline',
      responses: {
        200: z.array(z.object({
          digitIndex: z.number(),
          digitValue: z.number(),
          isSystem: z.boolean(),
          user: z.object({
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
            instagramHandle: z.string().nullable(),
          }).nullable(),
        })),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
