-- migrate:up
ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE OR REPLACE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION cleanup_user_mess_membership()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET mess_id = null
    WHERE users.id = OLD.user_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_user_mess_membership_trigger
AFTER DELETE ON sub_mess_members
FOR EACH ROW
EXECUTE FUNCTION cleanup_user_mess_membership();


-- migrate:down
DROP TRIGGER IF EXISTS cleanup_user_mess_membership_trigger ON sub_mess_members;
DROP FUNCTION IF EXISTS cleanup_user_mess_membership();
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
ALTER TABLE users
DROP COLUMN IF EXISTS updated_at;
