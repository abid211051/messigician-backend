import { z } from 'zod';
import { PER_PAGE_ITEMS } from '../../../core/core.constant.js';

const SORT_FIELDS = ['created_at', 'total_rent', 'no_of_members'] as const;

const SORT_ORDERS = ['asc', 'desc'] as const;

export const getAllSubMessSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce
      .number()
      .int()
      .min(10, 'limit must be at least 10')
      .max(40, 'limit must be at most 40')
      .default(PER_PAGE_ITEMS),
    search: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined),
    sortBy: z.enum(SORT_FIELDS).default('created_at'),
    sortOrder: z.enum(SORT_ORDERS).default('desc'),
  }),
});

export const getSingleSubMessSchema = z.object({
  params: z.object({
    id: z.uuid({ error: 'Invalid sub-mess ID format' }),
  }),
});

export const createSubMessSchema = z.object({
  body: z.object({
    fname: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(30, 'Name must be at most 30 characters'),
    total_rent: z.coerce
      .number()
      .nonnegative('Total rent must be non-negative')
      .optional(),
    no_of_seats: z.coerce
      .number()
      .int('Number of seats must be an integer')
      .positive('Number of seats must be positive')
      .optional(),
  }),
});

export const deleteSingleSubMessSchema = z.object({
  params: z.object({
    id: z.uuid({ error: 'Invalid sub-mess ID' }),
  }),
});

export const deleteBulkSubMessSchema = z.object({
  body: z.object({
    ids: z
      .array(z.uuid({ error: 'Invalid sub-mess ID' }))
      .min(1, 'Provide at least one sub-mess ID'),
  }),
});

export type GetAllSubMessQueryDto = z.infer<
  typeof getAllSubMessSchema.shape.query
>;

export type GetSingleSubMessParamsDto = z.infer<
  typeof getSingleSubMessSchema.shape.params
>;

export type CreateSubMessBodyDto = z.infer<
  typeof createSubMessSchema.shape.body
>;

export type DeleteSingleSubMessParamsDto = z.infer<
  typeof deleteSingleSubMessSchema.shape.params
>;

export type DeleteBulkSubMessBodyDto = z.infer<
  typeof deleteBulkSubMessSchema.shape.body
>;
