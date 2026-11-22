-- Metadata keterlacakan instrumen terhadap TP/IPK proposal.
SET @db_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='kode_tp') = 0,
  'ALTER TABLE soal ADD COLUMN kode_tp VARCHAR(5) NULL AFTER tujuan_pembelajaran',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='kode_ipk') = 0,
  'ALTER TABLE soal ADD COLUMN kode_ipk VARCHAR(8) NULL AFTER kode_tp',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='level_kognitif') = 0,
  "ALTER TABLE soal ADD COLUMN level_kognitif ENUM('C2','C3','C4') NULL AFTER kode_ipk",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND INDEX_NAME='idx_soal_tp_ipk') = 0,
  'ALTER TABLE soal ADD KEY idx_soal_tp_ipk (kode_tp, kode_ipk, level_kognitif)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
