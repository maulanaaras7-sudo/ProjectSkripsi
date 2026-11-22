-- Run after 02_seed_questions.sql.
SELECT setval(pg_get_serial_sequence('soal','id'),COALESCE((SELECT MAX(id) FROM soal),1),true);
SELECT setval(pg_get_serial_sequence('materi','id'),COALESCE((SELECT MAX(id) FROM materi),1),true);

-- Sanity checks: expected active banks are 450 training, 100 pre-test, 100 post-test.
SELECT jenis,tingkat_kesulitan,COUNT(*) AS jumlah
FROM soal
WHERE aktif=1
GROUP BY jenis,tingkat_kesulitan
ORDER BY jenis,tingkat_kesulitan;
