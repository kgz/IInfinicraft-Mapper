-- This file should undo anything in `up.sql`
-- ALTER TABLE element_maps
-- ADD FOREIGN KEY (result) REFERENCES elements(id);

ALTER TABLE element_maps
DROP FOREIGN KEY result;
