export const getAllSubMessByMessIdQuery = `
SELECT 
    id, 
    fname as sub_mess_name
FROM sub_mess
WHERE mess_id = $1
ORDER BY created_at DESC`;

export const getAllSubMessMembersCntQuery = `
SELECT 
    COUNT(*) 
FROM sub_mess_members smm
INNER JOIN sub_mess sm ON sm.id = smm.sub_mess_id
WHERE
  (cardinality($1::uuid[]) > 0 AND smm.sub_mess_id = ANY($1::uuid[]))
  OR
  (cardinality($1::uuid[]) = 0 AND sm.mess_id = $2::uuid)
  `;

export const getAllSubMessMembersQuery = `
SELECT 
    smm.*, 
    sm.fname as sub_mess_name,
    p.fname as tenant_name,
    p.images,
    p.phone,
    u.email
FROM sub_mess_members smm
INNER JOIN sub_mess sm ON sm.id = smm.sub_mess_id
INNER JOIN profiles p ON p.user_id = smm.user_id
INNER JOIN users u ON u.id = smm.user_id
WHERE
  (cardinality($1::uuid[]) > 0 AND smm.sub_mess_id = ANY($1::uuid[]))
  OR
  (cardinality($1::uuid[]) = 0 AND sm.mess_id = $2::uuid)
ORDER BY smm.created_at DESC
LIMIT $3 OFFSET $4
  `;
