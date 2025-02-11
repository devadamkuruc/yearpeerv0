// utils/validation.ts
import { z } from 'zod';
import {parseDate} from "@/utils/date.ts";

export const dateSchema = z.string().transform((str) => parseDate(str));

export const goalSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    title: z.string().min(1).max(255),
    description: z.string(),
    startDate: dateSchema,
    endDate: dateSchema,
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    impact: z.number().int().min(1).max(5),
    createdAt: dateSchema,
    updatedAt: dateSchema,
});

export const taskSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    goalId: z.string().uuid().optional(),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    date: dateSchema,
    completed: z.boolean(),
    order: z.number(),
    createdAt: dateSchema,
    updatedAt: dateSchema,
});
