-- One-time local setup. Run as root:  mysql -u root -p < server/db/setup.sql
-- Creates the database, the patterns table, and a least-privilege app account
-- (the API only ever inserts and reads single rows, so that is all it gets).

CREATE DATABASE IF NOT EXISTS drum_machine;
USE drum_machine;

CREATE TABLE IF NOT EXISTS patterns (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug       CHAR(8) NOT NULL UNIQUE,
  payload    JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP USER IF EXISTS drum_app;
CREATE USER drum_app IDENTIFIED BY 'Drum#2026';
GRANT SELECT, INSERT ON drum_machine.patterns TO drum_app;
