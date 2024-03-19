-- Your SQL goes here
-- -- trim the name column to remove whitespace from the beginning and end
UPDATE elements SET name = TRIM(name);
