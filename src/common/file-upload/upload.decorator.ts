import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { ALLOWED_TOTAL_FILES } from '../common.constant.js';
import { multerOptions } from './multer.config.js';

export const uploadSingle = UseInterceptors(
  FileInterceptor('file', multerOptions),
);

export const uploadMultiple = UseInterceptors(
  FilesInterceptor('files', ALLOWED_TOTAL_FILES, multerOptions),
);
