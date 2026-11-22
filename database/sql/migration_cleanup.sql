-- Perapihan struktur dan indeks tanpa menghapus data historis siswa.
SET NAMES utf8mb4;
USE fungsiverse;

SET @db_name = DATABASE();

-- Judul materi dibuat unik agar schema.sql aman dijalankan ulang.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='materi' AND INDEX_NAME='uq_materi_judul') = 0,
  'ALTER TABLE materi ADD UNIQUE KEY uq_materi_judul (judul)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Mempercepat filter bank soal dan pemilihan paket evaluasi.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND INDEX_NAME='idx_soal_bank') = 0,
  'ALTER TABLE soal ADD KEY idx_soal_bank (jenis, aktif, tingkat_kesulitan, sub_materi)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Mempercepat ringkasan hasil dan aktivitas terbaru siswa.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='jawaban_siswa' AND INDEX_NAME='idx_jawaban_user_waktu') = 0,
  'ALTER TABLE jawaban_siswa ADD KEY idx_jawaban_user_waktu (user_id, waktu)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='jawaban_siswa' AND INDEX_NAME='idx_jawaban_user_soal') = 0,
  'ALTER TABLE jawaban_siswa ADD KEY idx_jawaban_user_soal (user_id, soal_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Mempercepat daftar contoh berdasarkan tingkat, status, dan submateri.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='contoh_soal' AND INDEX_NAME='idx_contoh_bank') = 0,
  'ALTER TABLE contoh_soal ADD KEY idx_contoh_bank (tingkat, aktif, sub_materi, urutan)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Soal lama tanpa kode dipertahankan untuk menjaga riwayat, tetapi tidak boleh
-- bercampur dengan bank aktif yang sudah diverifikasi.
UPDATE soal SET aktif=0 WHERE kode_soal IS NULL;

ANALYZE TABLE materi, soal, contoh_soal, jawaban_siswa;
