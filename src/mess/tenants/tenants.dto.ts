import { z } from 'zod';

export const allSubMessMembersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
    sub_mess_ids: z
      .string()
      .optional()
      .transform((value) =>
        value
          ? value
              .split(',')
              .map((id) => id.trim())
              .filter(Boolean)
          : [],
      )
      .pipe(z.array(z.uuid({ error: 'One or more Sub-mess IDs are invalid' })))
      .default([]),
  }),
});

export const deleteSingleSubMessMemberSchema = z.object({
  params: z.object({
    id: z.uuid({ error: 'Invalid member ID' }),
  }),
});

export const deleteBulkSubMessMembersSchema = z.object({
  body: z.object({
    ids: z
      .array(z.uuid({ error: 'One or more member IDs are invalid' }))
      .min(1, 'One or more member IDs are invalid or the array is empty'),
  }),
});

export const editSubMessMemberSchema = z.object({
  params: z.object({
    id: z.uuid({ error: 'Invalid User ID' }),
  }),
  body: z
    .object({
      sub_mess_id: z.uuid({ error: 'Invalid Sub Mess ID' }).optional(),
      monthly_rent: z
        .number({ error: 'Monthly rent must be a number' })
        .nullable()
        .optional(),
      total_due: z
        .number({ error: 'Total due must be a number' })
        .nullable()
        .optional(),
    })
    .refine(
      (data) =>
        data.sub_mess_id !== undefined ||
        data.monthly_rent !== undefined ||
        data.total_due !== undefined,
      {
        error:
          'At least one of sub_mess_id, monthly_rent or total_due must be provided',
      },
    ),
});

export type AllSubMessMembersQueryDto = z.infer<
  typeof allSubMessMembersSchema.shape.query
>;

export type DeleteSingleSubMessMemberParamsDto = z.infer<
  typeof deleteSingleSubMessMemberSchema.shape.params
>;

export type DeleteBulkSubMessMembersBodyDto = z.infer<
  typeof deleteBulkSubMessMembersSchema.shape.body
>;

export type EditSubMessMemberParamsDto = z.infer<
  typeof editSubMessMemberSchema.shape.params
>;

export type EditSubMessMemberBodyDto = z.infer<
  typeof editSubMessMemberSchema.shape.body
>;
