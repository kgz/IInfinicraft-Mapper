-- This file should undo anything in `up.sql`
-- reverse fo ALTER TABLE element_maps
-- MODIFY COLUMN result INT;

-- UPDATE element_maps em 
-- JOIN elements e ON em.result = e.name
-- SET em.result = e.id

ALTER TABLE element_maps
MODIFY COLUMN result VARCHAR(255);

UPDATE element_maps em
JOIN elements e ON em.result = e.id
SET em.result = e.name;
