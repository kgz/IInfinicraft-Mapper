-- Your SQL goes here
-- generate a table of element maps with auto increment id, element id, second element id, result, with each column having an index and a foreign key to the elements table
CREATE TABLE element_maps (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  element_id INTEGER REFERENCES elements(id),
  second_element_id INTEGER REFERENCES elements(id),
  result TEXT
);

ALTER TABLE element_maps CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
