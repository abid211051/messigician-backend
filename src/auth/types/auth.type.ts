import { Request } from 'express';

export type AuthRequest = Request & {
  user?: {
    id: string;
    email: string;
    role: string;
    ban?: boolean | null;
    mess_role: string | null;
    mess_id: string | null;
    sub_mess_id: string | null;
  };
  cookies?: Record<string, string>;
};
