-- migrate:up
ALTER TABLE sub_mess_members
    ALTER COLUMN monthly_rent DROP DEFAULT,
    ALTER COLUMN total_due DROP DEFAULT,
    ALTER COLUMN total_paid DROP DEFAULT;

ALTER TABLE sub_mess_infos
    ALTER COLUMN total_rent DROP DEFAULT,
    ALTER COLUMN total_utility DROP DEFAULT;

ALTER TABLE users 
    ADD COLUMN sub_mess_id UUID REFERENCES sub_mess(id) ON DELETE SET NULL;

-- 2. Data Migration: Populate sub_mess_id for existing members
UPDATE public.users u
SET sub_mess_id = smm.sub_mess_id
FROM public.sub_mess_members smm
WHERE u.id = smm.user_id;


-- migrate:down

ALTER TABLE users 
    DROP COLUMN sub_mess_id;
    
ALTER TABLE sub_mess_infos
    ALTER COLUMN total_utility SET DEFAULT 0,
    ALTER COLUMN total_rent SET DEFAULT 0;

ALTER TABLE sub_mess_members
    ALTER COLUMN total_paid SET DEFAULT 0,
    ALTER COLUMN total_due SET DEFAULT 0,
    ALTER COLUMN monthly_rent SET DEFAULT 0;