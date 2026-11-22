-- Dataset awal fitur adaptif. Aman dijalankan ulang karena setiap pertanyaan unik dicek dahulu.
SET NAMES utf8mb4;

USE fungsiverse;

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 1,'pretest','sedang','[PRE-01] Relasi disebut fungsi apabila ...','setiap anggota domain memiliki tepat satu pasangan','setiap anggota kodomain memiliki dua pasangan','domain dan kodomain harus sama','semua pasangan bernilai nol','a','Syarat fungsi: setiap anggota domain dipasangkan tepat satu kali.'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[PRE-01]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 2,'pretest','sedang','[PRE-02] Jika f(x)=2x+1 dan g(x)=x-3, maka (f∘g)(4) adalah ...','1','2','3','4','c','g(4)=1, kemudian f(1)=3.'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[PRE-02]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 3,'pretest','sedang','[PRE-03] Invers dari f(x)=x+5 adalah ...','x+5','x-5','5-x','1/(x+5)','b','Tukar x dan y lalu selesaikan: y=x+5 menjadi x=y+5, sehingga y=x-5.'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[PRE-03]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 1,'latihan','rendah','[LAT-R-01] Jika f(x)=x+2, nilai f(3) adalah ...','1','3','5','6','c','Substitusikan x=3: f(3)=3+2=5.'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[LAT-R-01]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 2,'latihan','rendah','[LAT-R-02] Jika g(2)=4 dan f(4)=7, nilai (f∘g)(2) adalah ...','2','4','6','7','d','(f∘g)(2)=f(g(2))=f(4)=7.'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[LAT-R-02]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 2,'latihan','tinggi','[LAT-T-01] Jika f(x)=2x-1 dan g(x)=x²+1, bentuk (g∘f)(x) adalah ...','4x²-4x+2','2x²+1','4x²+2','x²-2x+2','a','g(f(x))=(2x-1)²+1=4x²-4x+2.'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[LAT-T-01]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 3,'latihan','tinggi','[LAT-T-02] Jika f(x)=(3x-2)/(x+1), maka f⁻¹(x) adalah ...','(x+2)/(3-x)','(x-2)/(3+x)','(2-x)/(x-3)','(3x+2)/(1-x)','a','Dari y=(3x-2)/(x+1), diperoleh x=(y+2)/(3-y).'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[LAT-T-02]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 1,'posttest','rendah','[POST-R-01] Jika f(x)=3x, nilai f(4) adalah ...','7','12','16','24','b','f(4)=3×4=12.'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[POST-R-01]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 2,'posttest','rendah','[POST-R-02] Jika f(x)=x+1 dan g(x)=2x, nilai (f∘g)(2) adalah ...','4','5','6','8','b','g(2)=4 lalu f(4)=5.'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[POST-R-02]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 2,'posttest','sedang','[POST-S-01] Jika f(x)=x+3 dan g(x)=2x-1, bentuk (f∘g)(x) adalah ...','2x+2','2x-4','x+2','2x+3','a','f(g(x))=(2x-1)+3=2x+2.'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[POST-S-01]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 3,'posttest','sedang','[POST-S-02] Invers dari f(x)=2x-6 adalah ...','(x-6)/2','(x+6)/2','2x+6','x/2-6','b','y=2x-6 memberikan x=(y+6)/2.'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[POST-S-02]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 2,'posttest','tinggi','[POST-T-01] Jika f(x)=x² dan g(x)=x+2, maka (f∘g)(x)-(g∘f)(x) adalah ...','4x+2','4x-2','2x+2','x²+4','a','(x+2)²-(x²+2)=4x+2.'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[POST-T-01]%');

INSERT INTO soal (materi_id, jenis, tingkat_kesulitan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, pembahasan)
SELECT 3,'posttest','tinggi','[POST-T-02] Jika f(x)=(x-1)/(x+2), maka f⁻¹(x) adalah ...','(1+2x)/(1-x)','(1-2x)/(x+1)','(x+1)/(x-2)','(2x-1)/(x+1)','a','Dari y=(x-1)/(x+2), diperoleh x=(1+2y)/(1-y).'
WHERE NOT EXISTS (SELECT 1 FROM soal WHERE pertanyaan LIKE '[POST-T-02]%');
