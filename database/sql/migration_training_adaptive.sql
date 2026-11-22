-- Tahap 1: fondasi latihan adaptif berbasis sesi.
-- Migrasi ini tidak menghapus tabel atau data lama dan aman dijalankan ulang.
SET NAMES utf8mb4;
USE fungsiverse;

SET @db_name = DATABASE();

-- Metadata Kurikulum Merdeka dan verifikasi matematis untuk bank soal.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='kode_soal') = 0,
  'ALTER TABLE soal ADD COLUMN kode_soal VARCHAR(50) NULL AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='sub_materi') = 0,
  'ALTER TABLE soal ADD COLUMN sub_materi VARCHAR(120) NULL AFTER tingkat_kesulitan',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='capaian_pembelajaran') = 0,
  'ALTER TABLE soal ADD COLUMN capaian_pembelajaran TEXT NULL AFTER sub_materi',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='tujuan_pembelajaran') = 0,
  'ALTER TABLE soal ADD COLUMN tujuan_pembelajaran TEXT NULL AFTER capaian_pembelajaran',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='metadata_verifikasi') = 0,
  'ALTER TABLE soal ADD COLUMN metadata_verifikasi JSON NULL AFTER pembahasan',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND COLUMN_NAME='aktif') = 0,
  'ALTER TABLE soal ADD COLUMN aktif TINYINT(1) NOT NULL DEFAULT 1 AFTER metadata_verifikasi',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='soal' AND INDEX_NAME='uq_soal_kode') = 0,
  'ALTER TABLE soal ADD UNIQUE KEY uq_soal_kode (kode_soal)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS progres_latihan (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tingkat_awal ENUM('rendah','sedang','tinggi') NOT NULL,
  tingkat_saat_ini ENUM('rendah','sedang','tinggi') NULL,
  selesai_latihan TINYINT(1) NOT NULL DEFAULT 0,
  posttest_diizinkan TINYINT(1) NOT NULL DEFAULT 0,
  alasan_selesai ENUM('lulus_tingkat_tinggi','batas_sesi_habis','migrasi_data_lama') NULL,
  dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  selesai_pada TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_progres_latihan_user (user_id),
  CONSTRAINT fk_progres_latihan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS progres_latihan_tingkat (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tingkat ENUM('rendah','sedang','tinggi') NOT NULL,
  jumlah_sesi INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('belum_dimulai','berjalan','lulus','dilewati','batas_sesi_habis') NOT NULL DEFAULT 'belum_dimulai',
  mulai_pada TIMESTAMP NULL DEFAULT NULL,
  selesai_pada TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_progres_user_tingkat (user_id, tingkat),
  CONSTRAINT fk_progres_tingkat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS riwayat_sesi_latihan (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tingkat ENUM('rendah','sedang','tinggi') NOT NULL,
  nomor_sesi INT UNSIGNED NOT NULL,
  jumlah_soal INT UNSIGNED NOT NULL,
  jumlah_benar INT UNSIGNED NULL,
  persentase DECIMAL(5,2) NULL,
  status ENUM('aktif','ulang','naik_tingkat','selesai_latihan','batas_sesi_habis') NOT NULL DEFAULT 'aktif',
  dimulai_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dikumpulkan_pada TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_sesi_user_tingkat_nomor (user_id, tingkat, nomor_sesi),
  KEY idx_sesi_user_status (user_id, status),
  CONSTRAINT fk_sesi_latihan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sesi_latihan_soal (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sesi_id BIGINT UNSIGNED NOT NULL,
  soal_id INT NOT NULL,
  urutan INT UNSIGNED NOT NULL,
  jawaban_dipilih ENUM('a','b','c','d','e') NULL,
  benar TINYINT(1) NULL,
  UNIQUE KEY uq_sesi_soal (sesi_id, soal_id),
  UNIQUE KEY uq_sesi_urutan (sesi_id, urutan),
  CONSTRAINT fk_sesi_soal_sesi FOREIGN KEY (sesi_id) REFERENCES riwayat_sesi_latihan(id) ON DELETE CASCADE,
  CONSTRAINT fk_sesi_soal_bank FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contoh_soal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_contoh VARCHAR(50) NOT NULL,
  tingkat ENUM('rendah','sedang','tinggi') NOT NULL,
  urutan INT UNSIGNED NOT NULL,
  sub_materi VARCHAR(120) NOT NULL,
  capaian_pembelajaran TEXT NOT NULL,
  tujuan_pembelajaran TEXT NOT NULL,
  pertanyaan TEXT NOT NULL,
  pilihan_a VARCHAR(255) NOT NULL,
  pilihan_b VARCHAR(255) NOT NULL,
  pilihan_c VARCHAR(255) NOT NULL,
  pilihan_d VARCHAR(255) NOT NULL,
  pilihan_e VARCHAR(255) NULL,
  jawaban_benar ENUM('a','b','c','d','e') NOT NULL,
  hint_1 TEXT NOT NULL,
  hint_2 TEXT NOT NULL,
  pembahasan TEXT NOT NULL,
  feedback_salah JSON NOT NULL,
  metadata_verifikasi JSON NULL,
  aktif TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_contoh_kode (kode_contoh),
  UNIQUE KEY uq_contoh_tingkat_urutan (tingkat, urutan)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS progres_contoh_soal (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  contoh_soal_id INT NOT NULL,
  jawaban_terakhir ENUM('a','b','c','d','e') NULL,
  jumlah_percobaan INT UNSIGNED NOT NULL DEFAULT 0,
  pernah_benar TINYINT(1) NOT NULL DEFAULT 0,
  pertama_dikerjakan_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  terakhir_dikerjakan_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_progres_contoh_user_soal (user_id, contoh_soal_id),
  CONSTRAINT fk_progres_contoh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_progres_contoh_soal FOREIGN KEY (contoh_soal_id) REFERENCES contoh_soal(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Backfill aman untuk siswa lama yang sudah menyelesaikan pretest.
INSERT IGNORE INTO progres_latihan
  (user_id, tingkat_awal, tingkat_saat_ini, selesai_latihan, posttest_diizinkan, alasan_selesai, selesai_pada)
SELECT id, kelompok,
       IF(posttest_selesai = 1, NULL, kelompok),
       posttest_selesai,
       posttest_selesai,
       IF(posttest_selesai = 1, 'migrasi_data_lama', NULL),
       IF(posttest_selesai = 1, NOW(), NULL)
FROM users
WHERE role = 'siswa' AND pretest_selesai = 1 AND kelompok IS NOT NULL;

INSERT IGNORE INTO progres_latihan_tingkat (user_id, tingkat, status, mulai_pada)
SELECT p.user_id, levels.tingkat,
       CASE
         WHEN p.selesai_latihan = 1 AND levels.urutan <= levels_awal.urutan THEN 'dilewati'
         WHEN levels.urutan < levels_awal.urutan THEN 'dilewati'
         WHEN levels.tingkat = p.tingkat_saat_ini THEN 'berjalan'
         ELSE 'belum_dimulai'
       END,
       IF(levels.tingkat = p.tingkat_saat_ini, NOW(), NULL)
FROM progres_latihan p
CROSS JOIN (
  SELECT 'rendah' AS tingkat, 1 AS urutan
  UNION ALL SELECT 'sedang', 2
  UNION ALL SELECT 'tinggi', 3
) levels
JOIN (
  SELECT 'rendah' AS tingkat, 1 AS urutan
  UNION ALL SELECT 'sedang', 2
  UNION ALL SELECT 'tinggi', 3
) levels_awal ON levels_awal.tingkat = p.tingkat_awal;

