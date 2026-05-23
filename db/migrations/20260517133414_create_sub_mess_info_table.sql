-- migrate:up
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE sub_mess_infos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    sub_mess_id UUID NOT NULL UNIQUE,

    total_rent NUMERIC(10, 2) DEFAULT 0,
    total_utility NUMERIC(10, 2) DEFAULT 0,
    no_of_seats INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_sub_mess_infos_sub_mess
        FOREIGN KEY (sub_mess_id)
        REFERENCES sub_mess(id)
        ON DELETE CASCADE,
    UNIQUE(sub_mess_id)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sub_mess_infos_updated_at
BEFORE UPDATE ON sub_mess_infos
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- migrate:down
DROP TRIGGER IF EXISTS update_sub_mess_infos_updated_at ON sub_mess_infos;

DROP FUNCTION IF EXISTS set_updated_at;

DROP TABLE IF EXISTS sub_mess_infos;