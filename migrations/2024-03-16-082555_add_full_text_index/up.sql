-- Your SQL goes here
-- add full test indexing to elements name column
ALTER TABLE elements ADD FULLTEXT(name);