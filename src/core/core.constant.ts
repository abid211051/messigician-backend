export const MB = (value: number) => value * 1024 * 1024;

export const MAX_UPLOAD_SIZE = MB(5);
export const MAX_IMAGE_SIZE = MB(2);
export const ALLOWED_TOTAL_FILES = 3;
export const PER_PAGE_ITEMS = 10;

export const ALLOWABLE_IMAGE_FORMAT = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWABLE_DOC_FORMAT = ['application/pdf'] as const;

export const CLOUDINARY_FOLDER = 'messigician';
