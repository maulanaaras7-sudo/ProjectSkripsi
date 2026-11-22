-- Skema database Fungsiverse
-- Import lewat phpMyAdmin atau: mysql -u root -p < schema.sql

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS fungsiverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fungsiverse;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('guru','siswa') NOT NULL DEFAULT 'siswa',
  kelompok ENUM('rendah','sedang','tinggi') NULL DEFAULT NULL,
  pretest_selesai TINYINT(1) NOT NULL DEFAULT 0,
  posttest_selesai TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS materi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(150) NOT NULL,
  urutan INT DEFAULT 0,
  konten TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_materi_judul (judul)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS soal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_soal VARCHAR(50) NULL,
  materi_id INT NULL,
  jenis ENUM('pretest','latihan','posttest') NOT NULL DEFAULT 'latihan',
  tingkat_kesulitan ENUM('rendah','sedang','tinggi') NOT NULL DEFAULT 'sedang',
  sub_materi VARCHAR(120) NULL,
  capaian_pembelajaran TEXT NULL,
  tujuan_pembelajaran TEXT NULL,
  kode_tp VARCHAR(5) NULL,
  kode_ipk VARCHAR(8) NULL,
  level_kognitif ENUM('C2','C3','C4') NULL,
  pertanyaan TEXT NOT NULL,
  pilihan_a VARCHAR(255) NOT NULL,
  pilihan_b VARCHAR(255) NOT NULL,
  pilihan_c VARCHAR(255) NOT NULL,
  pilihan_d VARCHAR(255) NOT NULL,
  pilihan_e VARCHAR(255) NULL,
  jawaban_benar ENUM('a','b','c','d','e') NOT NULL,
  pembahasan TEXT,
  metadata_verifikasi JSON NULL,
  aktif TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_soal_kode (kode_soal),
  KEY idx_soal_bank (jenis, aktif, tingkat_kesulitan, sub_materi),
  KEY idx_soal_tp_ipk (kode_tp, kode_ipk, level_kognitif),
  FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jawaban_siswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  soal_id INT NOT NULL,
  jawaban_dipilih ENUM('a','b','c','d','e') NOT NULL,
  benar TINYINT(1) NOT NULL,
  waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_jawaban_user_waktu (user_id, waktu),
  KEY idx_jawaban_user_soal (user_id, soal_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS draft_jawaban_evaluasi (
  user_id INT NOT NULL,
  attempt_key VARCHAR(191) NOT NULL,
  jenis ENUM('pretest','posttest') NOT NULL,
  soal_id INT NOT NULL,
  jawaban_dipilih ENUM('a','b','c','d','e') NOT NULL,
  diperbarui_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, attempt_key, soal_id),
  KEY idx_draft_evaluasi_user_jenis (user_id, jenis),
  CONSTRAINT fk_draft_evaluasi_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_draft_evaluasi_soal FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
) ENGINE=InnoDB;

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
  UNIQUE KEY uq_contoh_tingkat_urutan (tingkat, urutan),
  KEY idx_contoh_bank (tingkat, aktif, sub_materi, urutan)
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

-- Materi dasar. Aman dijalankan ulang karena judul bersifat unik.
INSERT INTO materi (judul, urutan, konten) VALUES
('Konsep Dasar Fungsi', 1, 'Fungsi adalah relasi yang memasangkan setiap anggota himpunan domain dengan tepat satu anggota himpunan kodomain. Notasi f(x) menyatakan nilai fungsi f untuk suatu nilai x.'),
('Komposisi Fungsi', 2, 'Komposisi fungsi (f∘g)(x) = f(g(x)) diperoleh dengan mensubstitusikan g(x) ke dalam f(x). Urutan pengerjaan penting: g dikerjakan terlebih dahulu, kemudian hasilnya dimasukkan ke f.'),
('Fungsi Invers', 3, 'Invers dari fungsi f, dinotasikan f⁻¹, adalah fungsi yang "membalikkan" pemetaan f. Jika f(a) = b maka f⁻¹(b) = a. Secara grafis, grafik f⁻¹ adalah pencerminan grafik f terhadap garis y = x.')
ON DUPLICATE KEY UPDATE urutan=VALUES(urutan), konten=VALUES(konten);
