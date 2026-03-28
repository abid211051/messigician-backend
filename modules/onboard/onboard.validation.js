import { z } from "zod";
import { imageFileSchema } from "../../utils/zodValidate.js";

const createMessSchema = z.object({
  body: z.object({
    fname: z
      .string({ error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters"),
  }),
  file: imageFileSchema.optional(),
});

const messJoinReqSchema = z.object({
  body: z.object({
    mess_id: z.uuid({ error: "Invalid mess Id" }),
    sub_mess_id: z.uuid({ error: "Invalid sub mess Id" }),
  }),
});
export { createMessSchema, messJoinReqSchema };
