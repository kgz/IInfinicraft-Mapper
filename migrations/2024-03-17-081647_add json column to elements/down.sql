-- This file should undo anything in `up.sql`
-- ALTER TABLE elements ADD COLUMN map JSON;

ALTER TABLE elements DROP COLUMN map;
