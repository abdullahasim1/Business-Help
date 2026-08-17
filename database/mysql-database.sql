-- Run this first for the normal Prisma setup.
-- Change the password before running this file.

CREATE DATABASE IF NOT EXISTS ai_widget_mvp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'widget_user'@'localhost'
  IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
CREATE USER IF NOT EXISTS 'widget_user'@'127.0.0.1'
  IDENTIFIED BY 'CHANGE_THIS_PASSWORD';

GRANT ALL PRIVILEGES ON ai_widget_mvp.* TO 'widget_user'@'localhost';
GRANT ALL PRIVILEGES ON ai_widget_mvp.* TO 'widget_user'@'127.0.0.1';
FLUSH PRIVILEGES;
