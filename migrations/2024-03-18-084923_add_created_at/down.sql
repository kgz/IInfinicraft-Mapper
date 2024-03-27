-- This file should undo anything in `up.sql`
-- ALTER TABLE elements ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE elements DROP COLUMN created_at;
