export const messCreationCTEQuery = `
    WITH mess_row AS (
        INSERT INTO mess (fname, images)
        VALUES ($1, $2::jsonb)
        RETURNING id, fname, images
    ),
    sub_mess_row AS (
        INSERT INTO sub_mess (mess_id, fname)
        SELECT id, $3 FROM mess_row
        RETURNING id, mess_id
    ),
    update_user AS (
        UPDATE users
        SET mess_id = mess_row.id, mess_role = 'owner'
        FROM mess_row
        WHERE users.id = $4
        RETURNING users.id, users.email, users.mess_id, users.mess_role
    ),
    manager_row AS (
        INSERT INTO sub_mess_managers (user_id, mess_id, sub_mess_id, is_owner)
        SELECT $4, mess_row.id, sub_mess_row.id, true
        FROM mess_row, sub_mess_row
    )
    SELECT * FROM update_user
`;

export const checkUserIsInMessQuery = `
    SELECT mess_id, mess_role 
    FROM users
    WHERE id=$1 AND mess_id IS NOT NULL;
`;

export const messJoinReqQuery = `
    INSERT INTO users_join_request (user_id, mess_id, sub_mess_id)
    SELECT $1, $2, $3
    WHERE EXISTS (
        SELECT *
        FROM users
        WHERE users.id = $1 AND users.mess_id IS NULL
    )
    RETURNING created_at
`;

export const getSubMessListQuery = `
    SELECT id, fname, mess_id
    FROM sub_mess
    WHERE mess_id = $1
`;
