const userAndProfileCTEQuery = `
    WITH user_row AS (
      INSERT INTO users (email)
      VALUES ($1)
      ON CONFLICT (email) DO UPDATE
      SET email = EXCLUDED.email
      RETURNING id, email, role, mess_role
    ),
    profile_row AS (
      INSERT INTO profiles (user_id, fname, images)
      SELECT id, $2, $3::jsonb FROM user_row
      ON CONFLICT (user_id) DO NOTHING
    )
    SELECT * FROM user_row;
    `;

const findAUser = `
    SELECT * FROM users
    WHERE users.email=$1
`;

export { userAndProfileCTEQuery, findAUser };
