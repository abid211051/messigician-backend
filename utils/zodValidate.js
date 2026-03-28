import { z } from "zod";
import {
  ALLOWABLE_DOC_FORMAT,
  ALLOWABLE_IMAGE_FORMAT,
  ALLOWED_TOTAL_FILES,
  MB,
} from "./constants.js";

function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        file: req.file,
        files: req.files,
        params: req.params,
        query: req.query,
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
