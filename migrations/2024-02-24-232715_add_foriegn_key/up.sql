-- Your SQL goes here
-- add foriuiengn key between element_maps and elements on result and id
--
ALTER TABLE element_maps
ADD FOREIGN KEY (result) REFERENCES elements(id);
