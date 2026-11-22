-- Bank evaluasi: 100 pretest dan 100 posttest setara.
-- Setiap bank diturunkan dari bank latihan terverifikasi, tetapi memakai
-- butir sumber yang berbeda. Aplikasi memilih 25 soal per siswa dengan
-- blueprint kesulitan dan submateri yang sama.
SET NAMES utf8mb4;
USE fungsiverse;
START TRANSACTION;

-- Riwayat jawaban tetap dipertahankan; hanya status paket lama dinonaktifkan.
UPDATE soal SET aktif=0 WHERE jenis IN ('pretest','posttest');

DROP TEMPORARY TABLE IF EXISTS ranked_evaluation_source;
CREATE TEMPORARY TABLE ranked_evaluation_source AS
SELECT s.*,
       DENSE_RANK() OVER (
         PARTITION BY s.tingkat_kesulitan ORDER BY s.sub_materi
       ) AS topic_rank,
       ROW_NUMBER() OVER (
         PARTITION BY s.tingkat_kesulitan,s.sub_materi ORDER BY s.kode_soal
       ) AS item_rank
FROM soal s
WHERE s.jenis='latihan' AND s.aktif=1;

DROP TEMPORARY TABLE IF EXISTS seed_evaluation_items;
CREATE TEMPORARY TABLE seed_evaluation_items (
  seq INT NOT NULL,
  jenis ENUM('pretest','posttest') NOT NULL,
  kode VARCHAR(50) NOT NULL,
  materi_id INT NULL,
  tingkat ENUM('rendah','sedang','tinggi') NOT NULL,
  sub_materi VARCHAR(120) NOT NULL,
  pertanyaan TEXT NOT NULL,
  pilihan_a VARCHAR(255) NOT NULL,
  pilihan_b VARCHAR(255) NOT NULL,
  pilihan_c VARCHAR(255) NOT NULL,
  pilihan_d VARCHAR(255) NOT NULL,
  pilihan_e VARCHAR(255) NULL,
  jawaban_benar ENUM('a','b','c','d','e') NOT NULL,
  pembahasan TEXT NOT NULL,
  metadata JSON NOT NULL,
  PRIMARY KEY (jenis,seq),
  UNIQUE KEY (kode)
);

-- Per tingkat dipilih 34 rendah, 33 sedang, dan 33 tinggi. Setiap submateri
-- menyumbang tiga atau empat varian sehingga paket acak tetap seimbang.
INSERT INTO seed_evaluation_items
(seq,jenis,kode,materi_id,tingkat,sub_materi,pertanyaan,
 pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,pembahasan,metadata)
SELECT seq,'pretest',CONCAT('PRE-F-',LPAD(seq,3,'0')),materi_id,
       tingkat_kesulitan,sub_materi,
       CONCAT('Evaluasi awal. ',pertanyaan),
       pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,
       pembahasan,metadata_verifikasi
FROM (
  SELECT r.*,
         ROW_NUMBER() OVER (
           ORDER BY FIELD(tingkat_kesulitan,'rendah','sedang','tinggi'),
                    topic_rank,item_rank
         ) AS seq
  FROM ranked_evaluation_source r
  WHERE item_rank <= CASE
    WHEN tingkat_kesulitan='rendah' THEN IF(topic_rank<=7,4,3)
    ELSE IF(topic_rank<=6,4,3)
  END
) selected_pre;

-- Posttest memakai varian berikutnya dari setiap sel tingkat/submateri agar
-- tidak mengulang butir matematika yang dipakai pada pretest.
INSERT INTO seed_evaluation_items
(seq,jenis,kode,materi_id,tingkat,sub_materi,pertanyaan,
 pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,pembahasan,metadata)
SELECT seq,'posttest',CONCAT('POST-F-',LPAD(seq,3,'0')),materi_id,
       tingkat_kesulitan,sub_materi,
       CONCAT('Evaluasi akhir. ',pertanyaan),
       pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,
       pembahasan,metadata_verifikasi
FROM (
  SELECT r.*,
         ROW_NUMBER() OVER (
           ORDER BY FIELD(tingkat_kesulitan,'rendah','sedang','tinggi'),
                    topic_rank,item_rank
         ) AS seq
  FROM ranked_evaluation_source r
  WHERE item_rank > CASE
      WHEN tingkat_kesulitan='rendah' THEN IF(topic_rank<=7,4,3)
      ELSE IF(topic_rank<=6,4,3)
    END
    AND item_rank <= 2 * CASE
      WHEN tingkat_kesulitan='rendah' THEN IF(topic_rank<=7,4,3)
      ELSE IF(topic_rank<=6,4,3)
    END
) selected_post;

INSERT INTO soal
(kode_soal,materi_id,jenis,tingkat_kesulitan,sub_materi,capaian_pembelajaran,
 tujuan_pembelajaran,pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,
 jawaban_benar,pembahasan,metadata_verifikasi,aktif)
SELECT kode,materi_id,jenis,tingkat,sub_materi,
 'Pada akhir Fase F, peserta didik mampu menerapkan operasi komposisi dan invers fungsi untuk menyelesaikan masalah.',
 CONCAT('Mengukur penguasaan ',REPLACE(sub_materi,'_',' '),' melalui paket evaluasi acak yang setara.'),
 pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,
 pembahasan,metadata,1
FROM seed_evaluation_items
ON DUPLICATE KEY UPDATE
 materi_id=VALUES(materi_id),jenis=VALUES(jenis),tingkat_kesulitan=VALUES(tingkat_kesulitan),
 sub_materi=VALUES(sub_materi),capaian_pembelajaran=VALUES(capaian_pembelajaran),
 tujuan_pembelajaran=VALUES(tujuan_pembelajaran),pertanyaan=VALUES(pertanyaan),
 pilihan_a=VALUES(pilihan_a),pilihan_b=VALUES(pilihan_b),pilihan_c=VALUES(pilihan_c),
 pilihan_d=VALUES(pilihan_d),pilihan_e=VALUES(pilihan_e),jawaban_benar=VALUES(jawaban_benar),
 pembahasan=VALUES(pembahasan),metadata_verifikasi=VALUES(metadata_verifikasi),aktif=1;

DROP TEMPORARY TABLE seed_evaluation_items;
DROP TEMPORARY TABLE ranked_evaluation_source;
COMMIT;
