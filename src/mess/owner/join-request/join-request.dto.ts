import { z } from 'zod';

export const joinRequestAcceptSchema = z.object({
  body: z.object({
    request_id: z.uuid({ error: 'Invalid request_id' }),
    user_id: z.uuid({ error: 'Invalid user_id' }),
    sub_mess_id: z.uuid({ error: 'Invalid sub_mess_id' }),
  }),
});

export const joinRequestRejectSchema = z.object({
  params: z.object({
    request_id: z.uuid({ error: 'Invalid request_id' }),
  }),
});

export const getJoinRequestsSchema = z.object({
  params: z.object({
    mess_id: z.uuid({ error: 'Invalid mess_id' }),
  }),
});

export type JoinRequestAcceptBodyDto = z.infer<
  typeof joinRequestAcceptSchema.shape.body
>;

export type JoinRequestRejectParamsDto = z.infer<
  typeof joinRequestRejectSchema.shape.params
>;

export type GetJoinRequestsParamsDto = z.infer<
  typeof getJoinRequestsSchema.shape.params
>;
