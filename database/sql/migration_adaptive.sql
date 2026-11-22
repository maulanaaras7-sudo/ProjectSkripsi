-- Migrasi fitur adaptif untuk database Fungsiverse yang sudah berisi data.
-- Aman dijalankan ulang: setiap kolom hanya ditambahkan bila belum ada.
SET NAMES utf8mb4;

USE fungsiverse;

SET @db_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='users' AND COLUMN_NAME='kelompok') = 0,
  "ALTER TABLE users ADD COLUMN kelompok ENUM('rendah','sedang','tinggi') NULL DEFAULT NULL AFTER role",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Dukungan instrumen pilihan ganda lima opsi; baris lama tetap valid dengan pilihan_e NULL.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='pilihan_e') = 0,
  'ALTER TABLE soal ADD COLUMN pilihan_e VARCHAR(255) NULL AFTER pilihan_d',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Lengkapi distraktor E pada 16 soal bawaan lama tanpa mengubah kunci atau riwayat jawaban.
UPDATE soal SET pilihan_e = '15' WHERE id = 1 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = '1/(2x+1)' WHERE id = 2 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = 'Setiap anggota kodomain harus memiliki pasangan' WHERE id = 3 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = 'setiap anggota domain tidak memiliki pasangan' WHERE id = 4 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = '5' WHERE id = 5 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = 'x/(x+5)' WHERE id = 6 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = '7' WHERE id = 7 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = '8' WHERE id = 8 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = '4x²-4x' WHERE id = 9 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = '(x+2)/(x-3)' WHERE id = 10 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = '9' WHERE id = 11 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = '3' WHERE id = 12 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = '2x-1' WHERE id = 13 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = 'x+3' WHERE id = 14 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = '4x+4' WHERE id = 15 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');
UPDATE soal SET pilihan_e = '(x+2)/(1-x)' WHERE id = 16 AND (pilihan_e IS NULL OR TRIM(pilihan_e) = '');

-- Data lain yang mungkin dibuat sebelum dukungan lima opsi juga wajib memiliki opsi E.
UPDATE soal SET pilihan_e = 'Tidak ada jawaban yang tepat'
WHERE pilihan_e IS NULL OR TRIM(pilihan_e) = '';

ALTER TABLE soal MODIFY pilihan_e VARCHAR(255) NOT NULL;
ALTER TABLE soal MODIFY jawaban_benar ENUM('a','b','c','d','e') NOT NULL;
ALTER TABLE jawaban_siswa MODIFY jawaban_dipilih ENUM('a','b','c','d','e') NOT NULL;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='users' AND COLUMN_NAME='pretest_selesai') = 0,
  'ALTER TABLE users ADD COLUMN pretest_selesai TINYINT(1) NOT NULL DEFAULT 0 AFTER kelompok',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='users' AND COLUMN_NAME='posttest_selesai') = 0,
  'ALTER TABLE users ADD COLUMN posttest_selesai TINYINT(1) NOT NULL DEFAULT 0 AFTER pretest_selesai',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Data soal lama dipertahankan sebagai latihan tingkat sedang.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='jenis') = 0,
  "ALTER TABLE soal ADD COLUMN jenis ENUM('pretest','latihan','posttest') NOT NULL DEFAULT 'latihan' AFTER materi_id",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='tingkat_kesulitan') = 0,
  "ALTER TABLE soal ADD COLUMN tingkat_kesulitan ENUM('rendah','sedang','tinggi') NOT NULL DEFAULT 'sedang' AFTER jenis",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
