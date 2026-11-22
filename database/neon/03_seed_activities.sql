-- Guided material activities. Safe to run more than once.
BEGIN;

INSERT INTO aktivitas_materi(materi_id,judul,deskripsi,soal_ringkas)
SELECT id,'Temukan Alur Komposisi Fungsi','Ikuti alur pengerjaan dari fungsi bagian dalam hingga memperoleh nilai akhir.','Diketahui f(x) = 2x + 1 dan g(x) = x² − 2. Tentukan nilai (f∘g)(2).'
FROM materi WHERE judul='Komposisi Fungsi'
ON CONFLICT(materi_id,judul) DO UPDATE SET deskripsi=EXCLUDED.deskripsi,soal_ringkas=EXCLUDED.soal_ringkas;

INSERT INTO langkah_aktivitas(aktivitas_id,urutan,pertanyaan,pilihan,jawaban_benar,feedback_benar,feedback_salah,petunjuk)
SELECT a.id,v.urutan,v.pertanyaan,v.pilihan,v.jawaban_benar,v.feedback_benar,v.feedback_salah,v.petunjuk
FROM aktivitas_materi a
CROSS JOIN (VALUES
  (1,'Pada (f∘g)(2), fungsi mana yang harus dikerjakan terlebih dahulu?','[{"value":"f","label":"Fungsi f"},{"value":"g","label":"Fungsi g"},{"value":"bersamaan","label":"Keduanya bersamaan"}]','g','Benar. Komposisi (f∘g)(x) berarti f(g(x)), jadi fungsi g dikerjakan lebih dahulu.','Belum tepat. Urutan simbol komposisi dibaca dari fungsi yang paling dekat dengan input.','Ubah dahulu (f∘g)(2) menjadi f(g(2)).'),
  (2,'Hitung nilai fungsi bagian dalam: g(2) = 2² − 2. Berapa hasilnya?','[{"value":"0","label":"0"},{"value":"2","label":"2"},{"value":"4","label":"4"},{"value":"6","label":"6"}]','2','Tepat. 2² = 4, kemudian 4 − 2 = 2.','Hasilnya belum tepat. Operasi pangkat dikerjakan sebelum pengurangan.','Hitung 2² terlebih dahulu, lalu kurangi 2.'),
  (3,'Karena g(2) = 2, bentuk substitusi berikutnya yang benar adalah ...','[{"value":"f(2)","label":"f(2)"},{"value":"g(2)","label":"g(2)"},{"value":"f(g)","label":"f(g)"},{"value":"2(f)","label":"2(f)"}]','f(2)','Benar. Hasil g(2) menjadi masukan fungsi f.','Belum tepat. Hasil fungsi g harus dimasukkan sebagai nilai x pada fungsi f.','Ganti g(2) pada f(g(2)) dengan hasilnya, yaitu 2.'),
  (4,'Selesaikan f(2) = 2(2) + 1. Berapa nilai akhir (f∘g)(2)?','[{"value":"3","label":"3"},{"value":"4","label":"4"},{"value":"5","label":"5"},{"value":"6","label":"6"}]','5','Hebat! (f∘g)(2) = f(g(2)) = f(2) = 5.','Periksa kembali perkalian dan penjumlahan pada 2(2) + 1.','Kerjakan 2 × 2 terlebih dahulu, kemudian tambahkan 1.')
) AS v(urutan,pertanyaan,pilihan,jawaban_benar,feedback_benar,feedback_salah,petunjuk)
WHERE a.judul='Temukan Alur Komposisi Fungsi'
ON CONFLICT(aktivitas_id,urutan) DO UPDATE SET pertanyaan=EXCLUDED.pertanyaan,pilihan=EXCLUDED.pilihan,jawaban_benar=EXCLUDED.jawaban_benar,feedback_benar=EXCLUDED.feedback_benar,feedback_salah=EXCLUDED.feedback_salah,petunjuk=EXCLUDED.petunjuk;

INSERT INTO aktivitas_materi(materi_id,judul,deskripsi,soal_ringkas)
SELECT id,'Kenali Sifat Suatu Fungsi','Amati pemetaan, lalu tentukan range dan sifat fungsi secara bertahap.','Diberikan f : A → B dengan A = {1, 2, 3}, B = {2, 4, 6}, dan f(x) = 2x. Analisis pemetaan tersebut.'
FROM materi WHERE judul='Konsep Dasar Fungsi'
ON CONFLICT(materi_id,judul) DO UPDATE SET deskripsi=EXCLUDED.deskripsi,soal_ringkas=EXCLUDED.soal_ringkas;

INSERT INTO langkah_aktivitas(aktivitas_id,urutan,pertanyaan,pilihan,jawaban_benar,feedback_benar,feedback_salah,petunjuk)
SELECT a.id,v.urutan,v.pertanyaan,v.pilihan,v.jawaban_benar,v.feedback_benar,v.feedback_salah,v.petunjuk
FROM aktivitas_materi a
CROSS JOIN (VALUES
  (1,'Apakah aturan f(x) = 2x pada pemetaan tersebut merupakan fungsi?','[{"value":"ya","label":"Ya, merupakan fungsi"},{"value":"tidak","label":"Tidak merupakan fungsi"}]','ya','Benar. Setiap anggota domain mempunyai tepat satu pasangan.','Belum tepat. Periksa pasangan 1 → 2, 2 → 4, dan 3 → 6.','Fungsi memasangkan setiap anggota domain dengan tepat satu pasangan.'),
  (2,'Himpunan manakah yang merupakan range dari fungsi f?','[{"value":"{1,2,3}","label":"{1, 2, 3}"},{"value":"{2,4,6}","label":"{2, 4, 6}"},{"value":"{1,2,3,4,6}","label":"{1, 2, 3, 4, 6}"},{"value":"{2,4}","label":"{2, 4}"}]','{2,4,6}','Tepat. Range fungsi adalah {2, 4, 6}.','Range berisi seluruh nilai keluaran yang benar-benar dihasilkan.','Hitung f(1), f(2), dan f(3).'),
  (3,'Apakah fungsi tersebut bersifat injektif?','[{"value":"injektif","label":"Ya, injektif"},{"value":"tidak-injektif","label":"Tidak injektif"}]','injektif','Benar. Setiap input berbeda menghasilkan output berbeda.','Belum tepat. Tidak ada dua input berbeda yang menghasilkan output sama.','Bandingkan f(1), f(2), dan f(3).'),
  (4,'Karena fungsi injektif dan seluruh anggota B menjadi range, sifat fungsi tersebut adalah ...','[{"value":"surjektif","label":"Hanya surjektif"},{"value":"bijektif","label":"Bijektif"},{"value":"bukan-fungsi","label":"Bukan fungsi"}]','bijektif','Hebat! Fungsi ini injektif sekaligus surjektif, sehingga bijektif.','Gabungkan dua kesimpulan yang telah ditemukan.','Fungsi yang injektif sekaligus surjektif disebut bijektif.')
) AS v(urutan,pertanyaan,pilihan,jawaban_benar,feedback_benar,feedback_salah,petunjuk)
WHERE a.judul='Kenali Sifat Suatu Fungsi'
ON CONFLICT(aktivitas_id,urutan) DO UPDATE SET pertanyaan=EXCLUDED.pertanyaan,pilihan=EXCLUDED.pilihan,jawaban_benar=EXCLUDED.jawaban_benar,feedback_benar=EXCLUDED.feedback_benar,feedback_salah=EXCLUDED.feedback_salah,petunjuk=EXCLUDED.petunjuk;

INSERT INTO aktivitas_materi(materi_id,judul,deskripsi,soal_ringkas)
SELECT id,'Susun Rumus Fungsi Invers','Balik hubungan input dan output secara bertahap hingga memperoleh rumus invers.','Diketahui fungsi f(x) = 2x + 3. Tentukan rumus f⁻¹(x).'
FROM materi WHERE judul='Fungsi Invers'
ON CONFLICT(materi_id,judul) DO UPDATE SET deskripsi=EXCLUDED.deskripsi,soal_ringkas=EXCLUDED.soal_ringkas;

INSERT INTO langkah_aktivitas(aktivitas_id,urutan,pertanyaan,pilihan,jawaban_benar,feedback_benar,feedback_salah,petunjuk)
SELECT a.id,v.urutan,v.pertanyaan,v.pilihan,v.jawaban_benar,v.feedback_benar,v.feedback_salah,v.petunjuk
FROM aktivitas_materi a
CROSS JOIN (VALUES
  (1,'Sifat apa yang harus dimiliki suatu fungsi agar mempunyai invers berupa fungsi?','[{"value":"injektif","label":"Hanya injektif"},{"value":"surjektif","label":"Hanya surjektif"},{"value":"bijektif","label":"Bijektif"},{"value":"konstan","label":"Konstan"}]','bijektif','Benar. Fungsi harus bijektif.','Fungsi invers membutuhkan pemetaan satu-satu dan seluruh kodomain tercakup.','Gabungan sifat injektif dan surjektif disebut apa?'),
  (2,'Langkah awal yang benar untuk f(x) = 2x + 3 adalah ...','[{"value":"y=2x+3","label":"y = 2x + 3"},{"value":"x=2x+3","label":"x = 2x + 3"},{"value":"y=2y+3","label":"y = 2y + 3"},{"value":"x=2y-3","label":"x = 2y − 3"}]','y=2x+3','Tepat. Ganti notasi f(x) menjadi y.','Pada langkah pertama, cukup ganti f(x) dengan y.','Tuliskan y = f(x).'),
  (3,'Dari y = 2x + 3, nyatakan x dalam bentuk y.','[{"value":"x=(y-3)/2","label":"x = (y − 3)/2"},{"value":"x=(y+3)/2","label":"x = (y + 3)/2"},{"value":"x=2y-3","label":"x = 2y − 3"},{"value":"x=y/2+3","label":"x = y/2 + 3"}]','x=(y-3)/2','Benar. x = (y − 3)/2.','Operasi pada 2x + 3 harus dibalik secara berurutan.','Pindahkan +3 menjadi −3, kemudian bagi 2.'),
  (4,'Setelah menukar peran x dan y, rumus fungsi invers yang diperoleh adalah ...','[{"value":"(x-3)/2","label":"f⁻¹(x) = (x − 3)/2"},{"value":"(x+3)/2","label":"f⁻¹(x) = (x + 3)/2"},{"value":"2x-3","label":"f⁻¹(x) = 2x − 3"},{"value":"1/(2x+3)","label":"f⁻¹(x) = 1/(2x + 3)"}]','(x-3)/2','Hebat! Rumus inversnya adalah f⁻¹(x) = (x − 3)/2.','Belum tepat. Tukarkan nama variabel pada bentuk terakhir.','Bentuk sebelum pertukaran adalah x = (y − 3)/2.')
) AS v(urutan,pertanyaan,pilihan,jawaban_benar,feedback_benar,feedback_salah,petunjuk)
WHERE a.judul='Susun Rumus Fungsi Invers'
ON CONFLICT(aktivitas_id,urutan) DO UPDATE SET pertanyaan=EXCLUDED.pertanyaan,pilihan=EXCLUDED.pilihan,jawaban_benar=EXCLUDED.jawaban_benar,feedback_benar=EXCLUDED.feedback_benar,feedback_salah=EXCLUDED.feedback_salah,petunjuk=EXCLUDED.petunjuk;

COMMIT;
