import { z } from "zod";

export const allSubMessSchema = z.object({
  params: z.object({
    mess_id: z.uuid({ error: "Invalid mess_id" }),
  }),
});

export const allSubMessMembersSchema = z.object({
  params: z.object({
    mess_id: z.uuid({ error: "Invalid mess_id" }),
  }),
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, { error: "Page number has to be at least 1" })
      .default(1),
    sub_mess_ids: z
      .string()
      .optional()
      .transform((val) => (val ? val.split(",").map((id) => id.trim()) : []))
      .pipe(
        z
          .array(z.string())
          .refine((ids) => ids.every((id) => z.uuid().safeParse(id).success), {
            message: "One or more sub_mess_ids are invalid",
          })
          .default([]),
      ),
  }),
});
