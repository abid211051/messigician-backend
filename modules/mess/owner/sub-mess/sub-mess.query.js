export const cntAllSubMessInfoQuery = `
SELECT COUNT(*)
FROM sub_mess
WHERE mess_id = $1
    AND ($2::TEXT IS NULL OR fname ILIKE $2)
`;

export const getAllSubMessInfoDataQuery = `
SELECT 
    sm.id,
    sm.fname as sub_mess_name,
    sm.created_at,
    smi.total_rent,
    smi.total_utility,
    smi.no_of_seats,
    COUNT(smm.id) as no_of_members
FROM sub_mess sm
LEFT JOIN sub_mess_infos smi ON sm.id = smi.sub_mess_id 
LEFT JOIN sub_mess_members smm ON sm.id = smm.sub_mess_id
WHERE sm.mess_id = $1
    AND ($2::TEXT IS NULL OR sm.fname ILIKE $2)
GROUP BY sm.id, sm.fname, sm.created_at, smi.total_rent, smi.total_utility, smi.no_of_seats
ORDER BY
    CASE 
        WHEN $3 = 'created_at' AND $4 = 'asc' THEN sm.created_at
    END ASC,
    CASE 
        WHEN $3 = 'created_at' AND $4 = 'desc' THEN sm.created_at
    END DESC,
    CASE 
        WHEN $3 = 'total_rent' AND $4 = 'asc' THEN smi.total_rent
    END ASC,
    CASE 
        WHEN $3 = 'total_rent' AND $4 = 'desc' THEN smi.total_rent
    END DESC,
    CASE 
        WHEN $3 = 'no_of_members' AND $4 = 'asc' THEN COUNT(smm.id)
    END ASC,
    CASE 
        WHEN $3 = 'no_of_members' AND $4 = 'desc' THEN COUNT(smm.id)
    END DESC
LIMIT $5 OFFSET $6
`;

export const createSubMessQuery = `
    INSERT INTO sub_mess (mess_id, fname)
    VALUES ($1, $2)
    RETURNING id
`;

export const createSubMessInfoQuery = ({ values, fields, placeholders }) => `
    INSERT INTO sub_mess_infos (${fields.join(", ")})
    VALUES (${placeholders.join(", ")})
`;

export const deleteSingleSubMessQuery = `
    DELETE FROM sub_mess
    WHERE id = $1
    RETURNING id;
`;

export const deleteBulkSubMessQuery = `
    DELETE FROM sub_mess
    WHERE id = ANY($1::uuid[])
    RETURNING id;
`;
