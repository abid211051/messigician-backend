import { z } from "zod";
import {
  ENUM_SORT_ORDER,
  PER_PAGE_ITEMS,
} from "../../../../utils/constants.js";

const ENUM_ARRAY = ["created_at", "total_rent", "no_of_members"];

export const getAllSubMessWithInfoSchema = z.object({
  params: z.object({
    mess_id: z.string().uuid("Invalid mess_id format"),
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
