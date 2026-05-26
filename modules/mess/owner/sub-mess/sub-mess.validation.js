import { z } from "zod";
import {
  ENUM_SORT_ORDER,
  PER_PAGE_ITEMS,
} from "../../../../utils/constants.js";

const ENUM_ARRAY = ["created_at", "total_rent", "no_of_members"];

export const getAllSubMessWithInfoSchema = z.object({
  params: z.object({
    mess_id: z.uuid("Invalid mess_id format"),
  }),

  query: z.object({
    page: z.coerce.number().int().min(1, "page must be at least 1").default(1),

    limit: z.coerce
      .number()
      .int()
      .min(10, "limit must be at least 10")
      .max(40, "limit must be at most 40")
      .default(PER_PAGE_ITEMS),

    search: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),

    sortBy: z
      .enum(ENUM_ARRAY, `sortBy must be one of: ${ENUM_ARRAY.join(", ")}`)
      .default("created_at"),

    sortOrder: z.enum(ENUM_SORT_ORDER).default("desc"),
  }),
});

export const createSubMessSchema = z.object({
  params: z.object({
    mess_id: z.uuid("Invalid mess_id format"),
  }),
  body: z.object({
    fname: z
      .string()
      .min(1, "Name is required")
      .max(30, "Name must be at most 30 characters"),
    total_rent: z.coerce
      .number()
      .nonnegative("Total rent must be a non-negative number")
      .optional(),
    no_of_seats: z.coerce
      .number()
      .int()
      .positive("Number of seats must be a positive integer")
      .optional(),
  }),
});

export const deleteSingleSubMessSchema = z.object({
  params: z.object({
    id: z.uuid({ error: "Invalid member ID" }),
  }),
});

export const deleteBulkSubMessSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).refine(
      (ids) => {
        if (ids.length === 0) return false;
        return ids.every((id) => z.uuid().safeParse(id).success);
      },
      { error: "One or more sub-mess IDs are invalid or the array is empty" },
    ),
  }),
});
