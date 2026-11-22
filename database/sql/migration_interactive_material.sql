SET NAMES utf8mb4;
USE fungsiverse;

CREATE TABLE IF NOT EXISTS aktivitas_materi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  materi_id INT NOT NULL,
  judul VARCHAR(180) NOT NULL,
  deskripsi TEXT NOT NULL,
  soal_ringkas TEXT NOT NULL,
  aktif TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aktivitas_materi FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET @db_name = DATABASE();
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='aktivitas_materi' AND COLUMN_NAME='soal_ringkas') = 0,
  'ALTER TABLE aktivitas_materi ADD COLUMN soal_ringkas TEXT NULL AFTER deskripsi',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS langkah_aktivitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aktivitas_id INT NOT NULL,
  urutan INT NOT NULL,
  pertanyaan TEXT NOT NULL,
  pilihan JSON NOT NULL,
  jawaban_benar VARCHAR(100) NOT NULL,
  feedback_benar TEXT NOT NULL,
  feedback_salah TEXT NOT NULL,
  petunjuk TEXT NOT NULL,
  UNIQUE KEY uq_langkah_urutan (aktivitas_id, urutan),
  CONSTRAINT fk_langkah_aktivitas FOREIGN KEY (aktivitas_id) REFERENCES aktivitas_materi(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS progres_aktivitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  langkah_id INT NOT NULL,
  jawaban_terakhir VARCHAR(100) NULL,
  jumlah_percobaan INT NOT NULL DEFAULT 0,
  selesai TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  selesai_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_progres_siswa_langkah (user_id, langkah_id),
  CONSTRAINT fk_progres_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_progres_langkah FOREIGN KEY (langkah_id) REFERENCES langkah_aktivitas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO aktivitas_materi (materi_id, judul, deskripsi, soal_ringkas)
SELECT m.id, 'Temukan Alur Komposisi Fungsi',
       'Ikuti alur pengerjaan dari fungsi bagian dalam hingga memperoleh nilai akhir.',
       'Diketahui f(x) = 2x + 1 dan g(x) = x² − 2. Tentukan nilai (f∘g)(2).'
FROM materi m
WHERE m.judul = 'Komposisi Fungsi'
  AND NOT EXISTS (
    SELECT 1 FROM aktivitas_materi a
    WHERE a.materi_id = m.id AND a.judul = 'Temukan Alur Komposisi Fungsi'
  );

UPDATE aktivitas_materi a
JOIN materi m ON m.id = a.materi_id
SET a.deskripsi = 'Ikuti alur pengerjaan dari fungsi bagian dalam hingga memperoleh nilai akhir.',
    a.soal_ringkas = 'Diketahui f(x) = 2x + 1 dan g(x) = x² − 2. Tentukan nilai (f∘g)(2).'
WHERE m.judul = 'Komposisi Fungsi' AND a.judul = 'Temukan Alur Komposisi Fungsi';

SET @aktivitas_id = (
  SELECT a.id FROM aktivitas_materi a
  JOIN materi m ON m.id = a.materi_id
  WHERE m.judul = 'Komposisi Fungsi' AND a.judul = 'Temukan Alur Komposisi Fungsi'
  LIMIT 1
);

INSERT IGNORE INTO langkah_aktivitas
(aktivitas_id, urutan, pertanyaan, pilihan, jawaban_benar, feedback_benar, feedback_salah, petunjuk) VALUES
(@aktivitas_id, 1,
 'Pada (f∘g)(2), fungsi mana yang harus dikerjakan terlebih dahulu?',
 JSON_ARRAY(JSON_OBJECT('value','f','label','Fungsi f'), JSON_OBJECT('value','g','label','Fungsi g'), JSON_OBJECT('value','bersamaan','label','Keduanya bersamaan')),
 'g',
 'Benar. Komposisi (f∘g)(x) berarti f(g(x)), jadi fungsi g berada di bagian dalam dan dikerjakan lebih dahulu.',
 'Belum tepat. Urutan simbol komposisi dibaca dari fungsi yang paling dekat dengan nilai input.',
 'Ubah dahulu (f∘g)(2) menjadi f(g(2)). Fungsi mana yang menempel langsung pada angka 2?'),
(@aktivitas_id, 2,
 'Hitung nilai fungsi bagian dalam: g(2) = 2² − 2. Berapa hasilnya?',
 JSON_ARRAY(JSON_OBJECT('value','0','label','0'), JSON_OBJECT('value','2','label','2'), JSON_OBJECT('value','4','label','4'), JSON_OBJECT('value','6','label','6')),
 '2',
 'Tepat. 2² = 4, kemudian 4 − 2 = 2, sehingga g(2) = 2.',
 'Hasilnya belum tepat. Perhatikan bahwa operasi pangkat dikerjakan sebelum pengurangan.',
 'Hitung 2² terlebih dahulu, baru kurangi hasilnya dengan 2.'),
(@aktivitas_id, 3,
 'Karena g(2) = 2, bentuk substitusi berikutnya yang benar adalah ...',
 JSON_ARRAY(JSON_OBJECT('value','f(2)','label','f(2)'), JSON_OBJECT('value','g(2)','label','g(2)'), JSON_OBJECT('value','f(g)','label','f(g)'), JSON_OBJECT('value','2(f)','label','2(f)')),
 'f(2)',
 'Benar. Hasil dari g(2) menjadi masukan untuk fungsi f, sehingga f(g(2)) berubah menjadi f(2).',
 'Belum tepat. Hasil fungsi g harus dimasukkan sebagai nilai x pada fungsi f.',
 'Ganti bagian g(2) pada f(g(2)) dengan hasil yang sudah ditemukan, yaitu 2.'),
(@aktivitas_id, 4,
 'Selesaikan f(2) = 2(2) + 1. Berapa nilai akhir (f∘g)(2)?',
 JSON_ARRAY(JSON_OBJECT('value','3','label','3'), JSON_OBJECT('value','4','label','4'), JSON_OBJECT('value','5','label','5'), JSON_OBJECT('value','6','label','6')),
 '5',
 'Hebat! Alurnya lengkap: (f∘g)(2) = f(g(2)) = f(2) = 2(2) + 1 = 5.',
 'Hampir selesai. Periksa kembali perkalian dan penjumlahan pada 2(2) + 1.',
 'Kerjakan perkalian 2 × 2 terlebih dahulu, kemudian tambahkan 1.');

INSERT INTO aktivitas_materi (materi_id, judul, deskripsi, soal_ringkas)
SELECT m.id, 'Kenali Sifat Suatu Fungsi',
       'Amati pemetaan, lalu tentukan range dan sifat fungsi secara bertahap.',
       'Diberikan f : A → B dengan A = {1, 2, 3}, B = {2, 4, 6}, dan f(x) = 2x. Analisis pemetaan tersebut.'
FROM materi m
WHERE m.judul = 'Konsep Dasar Fungsi'
  AND NOT EXISTS (
    SELECT 1 FROM aktivitas_materi a
    WHERE a.materi_id = m.id AND a.judul = 'Kenali Sifat Suatu Fungsi'
  );

SET @konsep_id = (
  SELECT a.id FROM aktivitas_materi a
  JOIN materi m ON m.id = a.materi_id
  WHERE m.judul = 'Konsep Dasar Fungsi' AND a.judul = 'Kenali Sifat Suatu Fungsi'
  LIMIT 1
);

INSERT IGNORE INTO langkah_aktivitas
(aktivitas_id, urutan, pertanyaan, pilihan, jawaban_benar, feedback_benar, feedback_salah, petunjuk) VALUES
(@konsep_id, 1,
 'Apakah aturan f(x) = 2x pada pemetaan tersebut merupakan fungsi?',
 JSON_ARRAY(JSON_OBJECT('value','ya','label','Ya, merupakan fungsi'), JSON_OBJECT('value','tidak','label','Tidak merupakan fungsi')),
 'ya',
 'Benar. Setiap anggota domain A mempunyai tepat satu pasangan di kodomain B.',
 'Belum tepat. Periksa pasangan 1 → 2, 2 → 4, dan 3 → 6.',
 'Suatu relasi merupakan fungsi jika setiap anggota domain memiliki tepat satu pasangan.'),
(@konsep_id, 2,
 'Himpunan manakah yang merupakan range dari fungsi f?',
 JSON_ARRAY(JSON_OBJECT('value','{1,2,3}','label','{1, 2, 3}'), JSON_OBJECT('value','{2,4,6}','label','{2, 4, 6}'), JSON_OBJECT('value','{1,2,3,4,6}','label','{1, 2, 3, 4, 6}'), JSON_OBJECT('value','{2,4}','label','{2, 4}')),
 '{2,4,6}',
 'Tepat. Nilai keluaran f(1), f(2), dan f(3) adalah 2, 4, dan 6, sehingga range = {2, 4, 6}.',
 'Belum tepat. Range berisi seluruh nilai keluaran yang benar-benar dihasilkan fungsi.',
 'Hitung f(1), f(2), dan f(3), lalu kumpulkan hasilnya.'),
(@konsep_id, 3,
 'Apakah fungsi tersebut bersifat injektif?',
 JSON_ARRAY(JSON_OBJECT('value','injektif','label','Ya, injektif'), JSON_OBJECT('value','tidak-injektif','label','Tidak injektif')),
 'injektif',
 'Benar. Setiap input yang berbeda menghasilkan output yang berbeda, sehingga fungsi bersifat injektif.',
 'Belum tepat. Tidak ada dua anggota domain berbeda yang menghasilkan nilai keluaran sama.',
 'Bandingkan hasil f(1), f(2), dan f(3). Apakah ada hasil yang sama?'),
(@konsep_id, 4,
 'Karena fungsi injektif dan seluruh anggota B menjadi range, sifat fungsi tersebut adalah ...',
 JSON_ARRAY(JSON_OBJECT('value','surjektif','label','Hanya surjektif'), JSON_OBJECT('value','bijektif','label','Bijektif'), JSON_OBJECT('value','bukan-fungsi','label','Bukan fungsi')),
 'bijektif',
 'Hebat! Fungsi ini injektif sekaligus surjektif, sehingga bersifat bijektif dan memiliki fungsi invers.',
 'Belum tepat. Gabungkan dua kesimpulan: output berbeda untuk input berbeda dan range sama dengan kodomain.',
 'Fungsi yang injektif sekaligus surjektif disebut fungsi bijektif.');

INSERT INTO aktivitas_materi (materi_id, judul, deskripsi, soal_ringkas)
SELECT m.id, 'Susun Rumus Fungsi Invers',
       'Balik hubungan input dan output secara bertahap hingga memperoleh rumus invers.',
       'Diketahui fungsi f(x) = 2x + 3. Tentukan rumus f⁻¹(x).'
FROM materi m
WHERE m.judul = 'Fungsi Invers'
  AND NOT EXISTS (
    SELECT 1 FROM aktivitas_materi a
    WHERE a.materi_id = m.id AND a.judul = 'Susun Rumus Fungsi Invers'
  );

SET @invers_id = (
  SELECT a.id FROM aktivitas_materi a
  JOIN materi m ON m.id = a.materi_id
  WHERE m.judul = 'Fungsi Invers' AND a.judul = 'Susun Rumus Fungsi Invers'
  LIMIT 1
);

INSERT IGNORE INTO langkah_aktivitas
(aktivitas_id, urutan, pertanyaan, pilihan, jawaban_benar, feedback_benar, feedback_salah, petunjuk) VALUES
(@invers_id, 1,
 'Sifat apa yang harus dimiliki suatu fungsi agar mempunyai invers berupa fungsi?',
 JSON_ARRAY(JSON_OBJECT('value','injektif','label','Hanya injektif'), JSON_OBJECT('value','surjektif','label','Hanya surjektif'), JSON_OBJECT('value','bijektif','label','Bijektif'), JSON_OBJECT('value','konstan','label','Konstan')),
 'bijektif',
 'Benar. Fungsi harus bersifat bijektif agar setiap output dapat dipasangkan kembali dengan tepat satu input.',
 'Belum tepat. Fungsi invers membutuhkan pemetaan satu-satu dan seluruh kodomain harus tercakup.',
 'Gabungan sifat injektif dan surjektif disebut apa?'),
(@invers_id, 2,
 'Langkah awal yang benar untuk f(x) = 2x + 3 adalah ...',
 JSON_ARRAY(JSON_OBJECT('value','y=2x+3','label','y = 2x + 3'), JSON_OBJECT('value','x=2x+3','label','x = 2x + 3'), JSON_OBJECT('value','y=2y+3','label','y = 2y + 3'), JSON_OBJECT('value','x=2y-3','label','x = 2y − 3')),
 'y=2x+3',
 'Tepat. Mulailah dengan mengganti notasi f(x) menjadi y, sehingga diperoleh y = 2x + 3.',
 'Belum tepat. Pada langkah pertama, cukup ganti f(x) dengan variabel y.',
 'Tuliskan y = f(x), lalu salin ruas kanan fungsi.'),
(@invers_id, 3,
 'Dari y = 2x + 3, nyatakan x dalam bentuk y.',
 JSON_ARRAY(JSON_OBJECT('value','x=(y-3)/2','label','x = (y − 3)/2'), JSON_OBJECT('value','x=(y+3)/2','label','x = (y + 3)/2'), JSON_OBJECT('value','x=2y-3','label','x = 2y − 3'), JSON_OBJECT('value','x=y/2+3','label','x = y/2 + 3')),
 'x=(y-3)/2',
 'Benar. Kurangi kedua ruas dengan 3, lalu bagi dengan 2: x = (y − 3)/2.',
 'Belum tepat. Operasi pada 2x + 3 harus dibalik secara berurutan.',
 'Pindahkan +3 menjadi −3, kemudian bagi kedua ruas dengan 2.'),
(@invers_id, 4,
 'Setelah menukar peran x dan y, rumus fungsi invers yang diperoleh adalah ...',
 JSON_ARRAY(JSON_OBJECT('value','(x-3)/2','label','f⁻¹(x) = (x − 3)/2'), JSON_OBJECT('value','(x+3)/2','label','f⁻¹(x) = (x + 3)/2'), JSON_OBJECT('value','2x-3','label','f⁻¹(x) = 2x − 3'), JSON_OBJECT('value','1/(2x+3)','label','f⁻¹(x) = 1/(2x + 3)')),
 '(x-3)/2',
 'Hebat! Rumus inversnya adalah f⁻¹(x) = (x − 3)/2. Invers ini mengembalikan keluaran f ke nilai input semula.',
 'Belum tepat. Ganti y pada bentuk x = (y − 3)/2 menjadi variabel x untuk menuliskan fungsi invers.',
 'Bentuk terakhir sebelum pertukaran adalah x = (y − 3)/2. Tukarkan nama variabelnya.');

UPDATE aktivitas_materi SET soal_ringkas = '' WHERE soal_ringkas IS NULL;
ALTER TABLE aktivitas_materi MODIFY soal_ringkas TEXT NOT NULL;
