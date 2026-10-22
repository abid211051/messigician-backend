import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';

import {
  ALLOWABLE_DOC_FORMAT,
  ALLOWABLE_IMAGE_FORMAT,
  MAX_UPLOAD_SIZE,
} from '../core.constant.js';
import { randomUUID } from 'node:crypto';

const allowedFormats: readonly string[] = [
  ...ALLOWABLE_DOC_FORMAT,
  ...ALLOWABLE_IMAGE_FORMAT,
];

export const multerOptions: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, callback) => {
      callback(
        null,
        `${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      );
    },
  }),

  limits: {
    fileSize: MAX_UPLOAD_SIZE,
    files: 3,
  },

  fileFilter: (_req, file, callback) => {
    if (allowedFormats.includes(file.mimetype)) {
      return callback(null, true);
    }

    return callback(
      new Error(
        `Invalid file type. Only ${allowedFormats.join(', ')} are allowed.`,
      ),
      false,
    );
  },
};
