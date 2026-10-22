import { z } from 'zod';

import {
  ALLOWABLE_DOC_FORMAT,
  ALLOWABLE_IMAGE_FORMAT,
  ALLOWED_TOTAL_FILES,
  MAX_IMAGE_SIZE,
  MAX_UPLOAD_SIZE,
} from '../core.constant.js';

export const imageFileSchema = z.object({
  mimetype: z.enum(ALLOWABLE_IMAGE_FORMAT, {
    error: 'Invalid image file type',
  }),
  size: z
    .number()
    .positive('File cannot be empty')
    .max(MAX_IMAGE_SIZE, 'Image must not exceed 2 MB'),
  path: z.string().min(1, 'Invalid uploaded file'),
  originalname: z.string().min(1, 'Invalid filename'),
});

export const imageFilesSchema = z
  .array(imageFileSchema)
  .min(1, 'At least one image is required')
  .max(ALLOWED_TOTAL_FILES, `Maximum ${ALLOWED_TOTAL_FILES} images allowed`);

export const documentFileSchema = z.object({
  mimetype: z.enum(ALLOWABLE_DOC_FORMAT, {
    error: 'Invalid document file type',
  }),
  size: z
    .number()
    .positive('File cannot be empty')
    .max(MAX_UPLOAD_SIZE, 'Document must not exceed 5 MB'),
  path: z.string().min(1, 'Invalid uploaded file'),
  originalname: z.string().min(1, 'Invalid filename'),
});
