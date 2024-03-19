-- Your SQL goes here
-- create table of elements with auto increment id, emoji isNew, name
CREATE TABLE elements (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  emoji TEXT NOT NULL,
  name TEXT NOT NULL,
  is_new BOOLEAN DEFAULT false
);

ALTER TABLE elements CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;