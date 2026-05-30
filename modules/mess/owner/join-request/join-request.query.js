export const getUserForUpdate = `
  SELECT id, mess_id FROM users WHERE id = $1
`;

export const deleteFromJoinRequestTable = `
DELETE FROM users_join_request
WHERE id = $1
`;

export const addUserIntoSubMess = `
WITH sub_mess_add AS (
    INSERT INTO sub_mess_members (user_id, sub_mess_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING user_id, sub_mess_id
)
UPDATE users
SET mess_id = (
        SELECT mess_id 
        FROM sub_mess 
        WHERE sub_mess.id = sub_mess_add.sub_mess_id
    ),
    sub_mess_id = sub_mess_add.sub_mess_id,
    mess_role = 'member'
FROM sub_mess_add
WHERE users.id = sub_mess_add.user_id
RETURNING users.id, users.mess_id, users.mess_role;
`;

export const getJoinRequestsByMessId = `
SELECT 
    ujr.*,
    sm.fname AS sub_mess_name,
    p.fname,
    p.phone,
    p.images,
    u.email
FROM users_join_request ujr
LEFT JOIN sub_mess sm 
    ON ujr.sub_mess_id = sm.id
LEFT JOIN profiles p 
    ON ujr.user_id = p.user_id
LEFT JOIN users u
    ON ujr.user_id = u.id
WHERE ujr.mess_id = $1
`;
