import { z } from 'zod';
import { imageFileSchema } from '../core/file-upload/upload.validation.js';

export const createMessSchema = z.object({
  body: z.object({
    fname: z
      .string({ error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters'),
  }),
  file: imageFileSchema.optional(),
});

export const messJoinReqSchema = z.object({
  body: z.object({
    mess_id: z.uuid({ error: 'Invalid mess Id' }),
    sub_mess_id: z.uuid({ error: 'Invalid sub mess Id' }),
  }),
});

export const subMessListSchema = z.object({
  params: z.object({
    mess_id: z.uuid({ error: 'Invalid mess Id' }),
  }),
});

export type CreateMessBodyDto = z.infer<typeof createMessSchema.shape.body>;
export type CreateMessFileDto = z.infer<typeof createMessSchema.shape.file>;

export type MessJoinReqBodyDto = z.infer<typeof messJoinReqSchema.shape.body>;
export type SubMessListParamsDto = z.infer<
  typeof subMessListSchema.shape.params
>;
