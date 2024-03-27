-- Your SQL goes here
-- add created at column to elements, default to now
ALTER TABLE elements ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
