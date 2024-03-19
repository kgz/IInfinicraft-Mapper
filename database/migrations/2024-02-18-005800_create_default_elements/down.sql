-- This file should undo anything in `up.sql`
DELETE FROM elements WHERE emoji = '🔥' AND name = 'Fire';
DELETE FROM elements WHERE emoji = '💧' AND name = 'Water';
DELETE FROM elements WHERE emoji = '🌬️' AND name = 'Wind';
DELETE FROM elements WHERE emoji = '🌍' AND name = 'Earth';
