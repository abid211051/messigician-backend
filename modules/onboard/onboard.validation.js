import { z } from "zod";
import { imageFileSchema } from "../../utils/zodValidate.js";

export const createMessSchema = z.object({
  body: z.object({
    fname: z
      .string({ error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters"),
  }),
  file: imageFileSchema.optional(),
});

export const messJoinReqSchema = z.object({
  body: z.object({
    mess_id: z.uuid({ error: "Invalid mess Id" }),
    sub_mess_id: z.uuid({ error: "Invalid sub mess Id" }),
  }),
});

export const subMessListSchema = z.object({
  params: z.object({
    mess_id: z.uuid({ error: "Invalid mess Id" }),
  }),
});
