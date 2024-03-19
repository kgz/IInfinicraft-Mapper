-- Your SQL goes here

-- update the result column to be an integer

UPDATE element_maps em 
JOIN elements e ON em.result = e.name
SET em.result = IFNULL(e.id, 0);

ALTER TABLE element_maps
MODIFY COLUMN result INT;
