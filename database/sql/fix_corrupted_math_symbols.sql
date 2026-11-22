-- Memperbaiki simbol matematika UTF-8 yang pernah tersimpan sebagai deretan tanda tanya.
-- Pembaruan dibatasi pada bank latihan tingkat rendah yang benar-benar terdampak.
SET NAMES utf8mb4;
USE fungsiverse;

CREATE TABLE IF NOT EXISTS soal_encoding_backup_20261104 LIKE soal;
INSERT IGNORE INTO soal_encoding_backup_20261104
SELECT * FROM soal
WHERE jenis = 'latihan'
  AND tingkat_kesulitan = 'rendah'
  AND CONCAT_WS(' ', pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d,
                pilihan_e, pembahasan, CAST(metadata_verifikasi AS CHAR)) REGEXP '[?]{2,}';

START TRANSACTION;

-- Simbol tiga byte: komposisi (∘). Simbol invers terdiri dari ⁻¹ (5 byte)
-- dan dapat diikuti simbol komposisi sehingga sebelumnya menjadi 8 tanda tanya.
UPDATE soal
SET pertanyaan = REPLACE(REPLACE(REPLACE(pertanyaan, '????????', '⁻¹∘'), '?????', '⁻¹'), '???', '∘'),
    pilihan_a = REPLACE(REPLACE(REPLACE(pilihan_a, '????????', '⁻¹∘'), '?????', '⁻¹'), '???', '∘'),
    pilihan_b = REPLACE(REPLACE(REPLACE(pilihan_b, '????????', '⁻¹∘'), '?????', '⁻¹'), '???', '∘'),
    pilihan_c = REPLACE(REPLACE(REPLACE(pilihan_c, '????????', '⁻¹∘'), '?????', '⁻¹'), '???', '∘'),
    pilihan_d = REPLACE(REPLACE(REPLACE(pilihan_d, '????????', '⁻¹∘'), '?????', '⁻¹'), '???', '∘'),
    pilihan_e = REPLACE(REPLACE(REPLACE(pilihan_e, '????????', '⁻¹∘'), '?????', '⁻¹'), '???', '∘'),
    pembahasan = REPLACE(REPLACE(REPLACE(pembahasan, '????????', '⁻¹∘'), '?????', '⁻¹'), '???', '∘'),
    metadata_verifikasi = REPLACE(REPLACE(REPLACE(
        CAST(metadata_verifikasi AS CHAR), '????????', '⁻¹∘'), '?????', '⁻¹'), '???', '∘')
WHERE jenis = 'latihan'
  AND tingkat_kesulitan = 'rendah'
  AND CONCAT_WS(' ', pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d,
                pilihan_e, pembahasan, CAST(metadata_verifikasi AS CHAR)) REGEXP '[?]{3,}';

-- Dua tanda tanya mempunyai arti berbeda sesuai konteks asalnya.
UPDATE soal
SET pilihan_a = REPLACE(pilihan_a, '??', '·'),
    pilihan_b = REPLACE(pilihan_b, '??', '·'),
    pilihan_c = REPLACE(pilihan_c, '??', '·'),
    pilihan_d = REPLACE(pilihan_d, '??', '·'),
    pilihan_e = REPLACE(pilihan_e, '??', '·')
WHERE jenis = 'latihan' AND tingkat_kesulitan = 'rendah'
  AND sub_materi = 'notasi_komposisi';

UPDATE soal
SET pertanyaan = REPLACE(pertanyaan, '??', '²')
WHERE jenis = 'latihan' AND tingkat_kesulitan = 'rendah'
  AND sub_materi = 'konsep_dan_syarat_invers';

UPDATE soal
SET pembahasan = REPLACE(pembahasan, '??', '×')
WHERE jenis = 'latihan' AND tingkat_kesulitan = 'rendah'
  AND sub_materi = 'kontekstual';

COMMIT;

