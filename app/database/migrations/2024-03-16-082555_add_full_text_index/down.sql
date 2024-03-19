-- This file should undo anything in `up.sql`
-- ALTER TABLE elements ADD FULLTEXT(name);
ALTER TABLE elements DROP INDEX name;
