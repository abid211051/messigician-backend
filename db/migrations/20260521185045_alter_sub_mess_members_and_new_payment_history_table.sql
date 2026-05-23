-- migrate:up
ALTER TABLE sub_mess_members
DROP COLUMN IF EXISTS rent,
DROP COLUMN IF EXISTS balance;

ALTER TABLE sub_mess_members
ADD COLUMN monthly_rent NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN total_due NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN total_paid NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE payment_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    sub_mess_id UUID NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    note TEXT,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_mess_id) REFERENCES sub_mess(id) ON DELETE CASCADE
);


CREATE TRIGGER update_sub_mess_members_updated_at
BEFORE UPDATE ON sub_mess_members
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER update_payment_histories_updated_at
BEFORE UPDATE ON payment_histories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- migrate:down
DROP TRIGGER IF EXISTS update_payment_histories_updated_at ON payment_histories;
DROP TRIGGER IF EXISTS update_sub_mess_members_updated_at ON sub_mess_members;
DROP TABLE IF EXISTS payment_histories;

ALTER TABLE sub_mess_members
DROP COLUMN IF EXISTS updated_at,
DROP COLUMN IF EXISTS total_paid,
DROP COLUMN IF EXISTS total_due,
DROP COLUMN IF EXISTS monthly_rent;

ALTER TABLE sub_mess_members
ADD COLUMN balance NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN rent NUMERIC(10, 2) DEFAULT 0;

