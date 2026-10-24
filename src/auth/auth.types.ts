import type { Request } from 'express';

export type MessRole = 'owner' | 'manager' | 'member' | null;

export type SystemRole = 'user' | 'admin' | 'moderator';

export interface IGoogleUserInfo {
  fname: string;
  email: string;
  avatar_url?: string;
}

export interface IUser {
  sub?: string;
  id: string;
  email?: string;
  role?: SystemRole;
  mess_id: string | null;
  mess_role?: MessRole;
  ban?: boolean | null;
  ban_reason?: string | null;
  created_at?: Date | null;
  updated_at?: Date;
  sub_mess_id?: string | null;
}

export type IGoogleUserPayload = Omit<
  IUser,
  'created_at' | 'updated_at' | 'ban_reason' | 'sub'
>;

export interface IAuthReq extends Request {
  user: IGoogleUserPayload;
}
