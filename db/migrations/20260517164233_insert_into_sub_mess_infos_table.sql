-- migrate:up
INSERT INTO sub_mess_infos (sub_mess_id)
SELECT id 
FROM sub_mess
WHERE NOT EXISTS (
    SELECT 1 
    FROM sub_mess_infos 
    WHERE sub_mess_id = sub_mess.id
);

-- migrate:down

