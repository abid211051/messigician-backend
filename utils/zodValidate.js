import { z } from "zod";
import {
  ALLOWABLE_DOC_FORMAT,
  ALLOWABLE_IMAGE_FORMAT,
  ALLOWED_TOTAL_FILES,
  MB,
} from "./constants.js";

// utils/zodValidate.js
const safeSetRequestProperty = (req, key, value) => {
  if (value === undefined) return;

  Object.defineProperty(req, key, {
    value: value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
};

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        file: req.file,
        files: req.files,
      });

      const keysToInject = ["params", "query", "body", "file", "files"];

      keysToInject.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) {
          safeSetRequestProperty(req, key, parsed[key]);
        }
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}

const imageFileSchema = z.object({
  mimetype: z.string().refine((t) => ALLOWABLE_IMAGE_FORMAT.includes(t), {
    error: `Only ${ALLOWABLE_IMAGE_FORMAT.join(", ")} are allowed`,
  }),
  size: z.number().max(MB(2), "Image must be under 2MB"),
});

const imageFilesSchema = z
  .array(imageFileSchema)
  .max(ALLOWED_TOTAL_FILES, `Maximum ${ALLOWED_TOTAL_FILES} images allowed`);

const documentFileSchema = z.object({
  mimetype: z.string().refine((t) => ALLOWABLE_DOC_FORMAT.includes(t), {
    error: `Only ${ALLOWABLE_DOC_FORMAT.join(", ")} files are allowed`,
  }),
  size: z.number().max(MB(5), "Document must be under 5MB"),
});

export { validate, imageFileSchema, imageFilesSchema, documentFileSchema };
