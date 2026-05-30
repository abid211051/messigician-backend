import { z } from "zod";

export const allSubMessSchema = z.object({
  params: z.object({
    mess_id: z.uuid({ error: "Invalid mess ID" }),
  }),
});

export const allSubMessMembersSchema = z.object({
  params: z.object({
    mess_id: z.string().uuid("Invalid mess ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1, "page must be at least 1").default(1),
    sub_mess_ids: z
      .string()
      .optional()
      .transform((val) =>
        val
          ? val
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean)
          : [],
      )
      .refine((ids) => ids.every((id) => z.uuid().safeParse(id).success), {
        message: "One or more Sub-mess IDs are invalid",
      })
      .default([]),
  }),
});

export const deleteSingleSubMessMemberSchema = z.object({
  params: z.object({
    id: z.uuid({ error: "Invalid member ID" }),
  }),
});

export const deleteBulkSubMessMembersSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).refine(
      (ids) => {
        if (ids.length === 0) return false;
        return ids.every((id) => z.uuid().safeParse(id).success);
      },
      { error: "One or more member IDs are invalid or the array is empty" },
    ),
  }),
});

export const editSubMessMemberSchema = z.object({
  params: z.object({
    id: z.uuid({ error: "Invalid User ID" }),
  }),
  body: z
    .object({
      sub_mess_id: z.uuid({ error: "Invalid Sub Mess ID" }).optional(),
      monthly_rent: z
        .union([z.number({ error: "Monthly rent must be a number" }), z.null()])
        .optional(),

      total_due: z
        .union([z.number({ error: "Total due must be a number" }), z.null()])
        .optional(),
    })
    .refine(
      (data) =>
        data.sub_mess_id !== undefined ||
        data.monthly_rent !== undefined ||
        data.total_due !== undefined,
      {
        error:
          "At least one of sub_mess_id, monthly_rent or total_due must be provided",
      },
    ),
});
