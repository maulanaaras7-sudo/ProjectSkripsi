-- Bank latihan tingkat rendah: 150 soal Kurikulum Merdeka Fase F.
-- Setiap kelompok template diberi metadata agar jawaban dihitung ulang oleh
-- tools/verify_question_bank.php, bukan sekadar dipercaya dari kunci SQL.
SET NAMES utf8mb4;
USE fungsiverse;

START TRANSACTION;

-- Data lama dipertahankan, tetapi tidak dicampur ke paket terverifikasi.
UPDATE soal SET aktif = 0
WHERE jenis = 'latihan' AND tingkat_kesulitan = 'rendah'
  AND (kode_soal IS NULL OR kode_soal NOT REGEXP '^LAT-R-[0-9]{3}$');

DROP TEMPORARY TABLE IF EXISTS seed_numbers;
CREATE TEMPORARY TABLE seed_numbers (n INT PRIMARY KEY);
INSERT INTO seed_numbers (n) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),
(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28),(29),(30);

DROP TEMPORARY TABLE IF EXISTS seed_low_items;
CREATE TEMPORARY TABLE seed_low_items (
  seq INT PRIMARY KEY,
  kode VARCHAR(50) NOT NULL,
  sub_materi VARCHAR(120) NOT NULL,
  tujuan TEXT NOT NULL,
  pertanyaan TEXT NOT NULL,
  benar VARCHAR(255) NOT NULL,
  salah_1 VARCHAR(255) NOT NULL,
  salah_2 VARCHAR(255) NOT NULL,
  salah_3 VARCHAR(255) NOT NULL,
  salah_4 VARCHAR(255) NOT NULL,
  pembahasan TEXT NOT NULL,
  metadata JSON NOT NULL
);

-- 1-18: konsep dan notasi komposisi.
INSERT INTO seed_low_items
SELECT n, CONCAT('LAT-R-', LPAD(n,3,'0')), 'notasi_komposisi',
       'Mengenali urutan fungsi pada notasi komposisi.',
       CONCAT('Diberikan f(x)=',2+MOD(n,4),'x+',n,' dan g(x)=x+',1+MOD(n,5),'. Bentuk notasi (f∘g)(x) yang benar adalah ...'),
       'f(g(x))','g(f(x))','f(x)+g(x)','f(x)·g(x)','g(x)-f(x)',
       '(f∘g)(x) berarti keluaran g digunakan sebagai masukan fungsi f, sehingga bentuknya f(g(x)).',
       JSON_OBJECT('kind','literal','expected','f(g(x))')
FROM seed_numbers WHERE n<=18;

-- 19-42: nilai komposisi dua fungsi linear sederhana.
INSERT INTO seed_low_items
SELECT 18+n, CONCAT('LAT-R-',LPAD(18+n,3,'0')), 'nilai_dan_rumus_komposisi',
       'Menghitung nilai komposisi dua fungsi linear secara berurutan.',
       CONCAT('Jika f(x)=',a,'x+',b,' dan g(x)=x+',c,', nilai (f∘g)(',xv,') adalah ...'),
       CAST(v AS CHAR),CAST(v+1 AS CHAR),CAST(v-1 AS CHAR),CAST(v+a AS CHAR),CAST(v-a AS CHAR),
       CONCAT('Hitung g(',xv,')=',xv,'+',c,'=',xv+c,', lalu f(',xv+c,')=',a,'(',xv+c,')+',b,'=',v,'.'),
       JSON_OBJECT('kind','compose_linear_value','a',a,'b',b,'c',c,'x',xv)
FROM (
  SELECT n,2+MOD(n,4) a,1+MOD(n,7) b,1+MOD(n,5) c,1+MOD(n-1,9) xv,
         (2+MOD(n,4))*(1+MOD(n-1,9)+1+MOD(n,5))+(1+MOD(n,7)) v
  FROM seed_numbers WHERE n<=24
) p;

-- 43-57: menentukan fungsi luar ketika komposisi dan fungsi dalam diketahui.
INSERT INTO seed_low_items
SELECT 42+n, CONCAT('LAT-R-',LPAD(42+n,3,'0')), 'menentukan_fungsi_penyusun',
       'Menentukan fungsi linear penyusun dari komposisi yang diketahui.',
       CONCAT('Diketahui g(x)=x+',c,' dan (f∘g)(x)=',a,'x+',q,'. Fungsi f(x) adalah ...'),
       CONCAT(a,'x+',k),CONCAT(a,'x+',k+1),CONCAT(a,'x+',k+2),CONCAT(a,'x+',k+3),CONCAT(a,'x+',k+4),
       CONCAT('Misalkan f(x)=',a,'x+d. Karena f(x+',c,')=',a,'x+',a*c,'+d=',a,'x+',q,', maka d=',k,'.'),
       JSON_OBJECT('kind','recover_outer_linear','a',a,'c',c,'q',q)
FROM (
  SELECT n,2+MOD(n,4) a,1+MOD(n,4) c,n+1 k,(n+1)+(2+MOD(n,4))*(1+MOD(n,4)) q
  FROM seed_numbers WHERE n<=15
) p;

-- 58-72: sifat tidak komutatif.
INSERT INTO seed_low_items
SELECT 57+n, CONCAT('LAT-R-',LPAD(57+n,3,'0')), 'sifat_komposisi',
       'Mengidentifikasi sifat tidak komutatif pada komposisi fungsi.',
       CONCAT('Untuk f(x)=x+',n,' dan g(x)=2x diperoleh (f∘g)(x)=2x+',n,' sedangkan (g∘f)(x)=2x+',2*n,'. Kesimpulan yang tepat adalah ...'),
       'Komposisi fungsi tidak komutatif','Komposisi fungsi selalu komutatif','Kedua fungsi merupakan fungsi identitas','Komposisi tidak memiliki urutan','f dan g adalah fungsi yang sama',
       'Hasil f∘g dan g∘f berbeda. Ini menunjukkan bahwa pada umumnya komposisi fungsi tidak komutatif.',
       JSON_OBJECT('kind','literal','expected','Komposisi fungsi tidak komutatif')
FROM seed_numbers WHERE n<=15;

-- 73-88: konsep dan syarat suatu fungsi mempunyai invers.
INSERT INTO seed_low_items
SELECT 72+n, CONCAT('LAT-R-',LPAD(72+n,3,'0')), 'konsep_dan_syarat_invers',
       'Menentukan keberadaan invers berdasarkan sifat satu-satu atau bijektif.',
       IF(n<=8,
          CONCAT('Apakah f(x)=',n+1,'x+',n,' pada bilangan real mempunyai fungsi invers?'),
          CONCAT('Apakah f(x)=x²+',n-8,' pada seluruh bilangan real mempunyai fungsi invers?')),
       IF(n<=8,'Ya, karena fungsi tersebut bijektif','Tidak, karena fungsi tersebut tidak satu-satu'),
       IF(n<=8,'Tidak, karena fungsi linear tidak memiliki invers','Ya, karena semua fungsi kuadrat bijektif'),
       'Ya, karena invers sama dengan 1/f(x)','Tidak, karena domain selalu kosong','Hanya jika nilai x sama dengan nol',
       IF(n<=8,
          'Fungsi linear dengan gradien tidak nol bersifat satu-satu dan memetakan bilangan real ke bilangan real, sehingga mempunyai invers.',
          'Pada domain seluruh bilangan real, nilai x dan -x memberi keluaran sama pada fungsi kuadrat. Fungsi tidak satu-satu sehingga tidak mempunyai invers berupa fungsi.'),
       JSON_OBJECT('kind','literal','expected',IF(n<=8,'Ya, karena fungsi tersebut bijektif','Tidak, karena fungsi tersebut tidak satu-satu'))
FROM seed_numbers WHERE n<=16;

-- 89-100: menentukan nilai invers fungsi linear.
INSERT INTO seed_low_items
SELECT 88+n, CONCAT('LAT-R-',LPAD(88+n,3,'0')), 'rumus_dan_nilai_invers',
       'Menentukan nilai invers fungsi linear dari pasangan input-output.',
       CONCAT('Jika f(x)=',a,'x+',b,' dan f(',inputv,')=',outputv,', maka f⁻¹(',outputv,') adalah ...'),
       CAST(inputv AS CHAR),CAST(inputv+1 AS CHAR),CAST(inputv-1 AS CHAR),CAST(inputv+2 AS CHAR),CAST(inputv-2 AS CHAR),
       CONCAT('Karena f(',inputv,')=',outputv,', fungsi invers mengembalikan ',outputv,' ke ',inputv,'.'),
       JSON_OBJECT('kind','inverse_linear_value','input',inputv)
FROM (
  SELECT n,2+MOD(n,4) a,1+MOD(n,6) b,n inputv,(2+MOD(n,4))*n+(1+MOD(n,6)) outputv
  FROM seed_numbers WHERE n<=12
) p;

-- 101-112: menentukan rumus invers fungsi linear.
INSERT INTO seed_low_items
SELECT 100+n, CONCAT('LAT-R-',LPAD(100+n,3,'0')), 'rumus_dan_nilai_invers',
       'Menentukan rumus invers fungsi linear sederhana.',
       CONCAT('Rumus invers dari f(x)=',a,'x+',b,' adalah ...'),
       CONCAT('(x-',b,')/',a),CONCAT('(x+',b,')/',a),CONCAT(a,'x-',b),CONCAT('(x-',b,')*',a),CONCAT('1/(',a,'x+',b,')'),
       CONCAT('Tuliskan y=',a,'x+',b,', lalu selesaikan untuk x: x=(y-',b,')/',a,'. Jadi f⁻¹(x)=(x-',b,')/',a,'.'),
       JSON_OBJECT('kind','inverse_linear_formula','a',a,'b',b)
FROM (
  SELECT n,2+MOD(n,4) a,n+1 b FROM seed_numbers WHERE n<=12
) p;

-- 113-126: urutan invers dari komposisi.
INSERT INTO seed_low_items
SELECT 112+n, CONCAT('LAT-R-',LPAD(112+n,3,'0')), 'invers_komposisi',
       'Mengenali urutan invers dari komposisi dua fungsi bijektif.',
       CONCAT('Diberikan fungsi bijektif f(x)=',2+MOD(n,3),'x+',n,' dan g(x)=x+',1+MOD(n,4),'. Bentuk (f∘g)⁻¹ yang benar adalah ...'),
       'g⁻¹∘f⁻¹','f⁻¹∘g⁻¹','f∘g','g∘f','f⁻¹∘g',
       'Invers komposisi membalik fungsi sekaligus urutannya: (f∘g)⁻¹=g⁻¹∘f⁻¹.',
       JSON_OBJECT('kind','literal','expected','g⁻¹∘f⁻¹')
FROM seed_numbers WHERE n<=14;

-- 127-138: pencerminan titik pada grafik invers.
INSERT INTO seed_low_items
SELECT 126+n, CONCAT('LAT-R-',LPAD(126+n,3,'0')), 'grafik_fungsi_dan_invers',
       'Menentukan pasangan titik pada grafik fungsi invers.',
       CONCAT('Titik (',p,',',q,') terletak pada grafik y=f(x). Titik yang bersesuaian pada grafik y=f⁻¹(x) adalah ...'),
       CONCAT('(',q,',',p,')'),CONCAT('(',p,',',q,')'),CONCAT('(',-q,',',-p,')'),CONCAT('(',q,',',-p,')'),CONCAT('(',-q,',',p,')'),
       CONCAT('Grafik fungsi dan invers simetris terhadap y=x, sehingga koordinat ditukar: (',p,',',q,') menjadi (',q,',',p,').'),
       JSON_OBJECT('kind','point_swap','p',p,'q',q)
FROM (SELECT n,n p,2*n+1 q FROM seed_numbers WHERE n<=12) p;

-- 139-150: konteks mesin dua tahap.
INSERT INTO seed_low_items
SELECT 138+n, CONCAT('LAT-R-',LPAD(138+n,3,'0')), 'kontekstual',
       'Memodelkan dan menghitung proses berurutan sebagai komposisi fungsi.',
       CONCAT('Sebuah mesin pertama menambah bilangan dengan ',c,' lalu mesin kedua mengalikan hasilnya dengan ',a,'. Jika bilangan awal ',xv,', hasil akhirnya adalah ...'),
       CAST(v AS CHAR),CAST(v+1 AS CHAR),CAST(v-1 AS CHAR),CAST(v+a AS CHAR),CAST(v-a AS CHAR),
       CONCAT('Tahap pertama menghasilkan ',xv,'+',c,'=',xv+c,'. Tahap kedua menghasilkan ',a,'×',xv+c,'=',v,'.'),
       JSON_OBJECT('kind','contextual_compose','a',a,'c',c,'x',xv)
FROM (
  SELECT n,2+MOD(n,4) a,1+MOD(n,4) c,n xv,(2+MOD(n,4))*(n+1+MOD(n,4)) v
  FROM seed_numbers WHERE n<=12
) p;

-- Rotasi lima opsi membuat sebaran kunci A-E seimbang (masing-masing 30).
INSERT INTO soal
(kode_soal,materi_id,jenis,tingkat_kesulitan,sub_materi,capaian_pembelajaran,tujuan_pembelajaran,
 pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,pembahasan,metadata_verifikasi,aktif)
SELECT kode,
       CASE WHEN sub_materi IN ('konsep_dan_syarat_invers','rumus_dan_nilai_invers','invers_komposisi','grafik_fungsi_dan_invers')
            THEN (SELECT id FROM materi WHERE judul='Fungsi Invers' LIMIT 1)
            ELSE (SELECT id FROM materi WHERE judul='Komposisi Fungsi' LIMIT 1) END,
       'latihan','rendah',sub_materi,
       'Pada akhir Fase F, peserta didik mampu menerapkan operasi komposisi dan invers fungsi untuk menyelesaikan masalah.',
       tujuan,pertanyaan,
       ELT(MOD(0-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
       ELT(MOD(1-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
       ELT(MOD(2-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
       ELT(MOD(3-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
       ELT(MOD(4-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
       ELT(MOD(seq-1,5)+1,'a','b','c','d','e'),pembahasan,metadata,1
FROM seed_low_items
ON DUPLICATE KEY UPDATE
  materi_id=VALUES(materi_id),sub_materi=VALUES(sub_materi),capaian_pembelajaran=VALUES(capaian_pembelajaran),
  tujuan_pembelajaran=VALUES(tujuan_pembelajaran),pertanyaan=VALUES(pertanyaan),pilihan_a=VALUES(pilihan_a),
  pilihan_b=VALUES(pilihan_b),pilihan_c=VALUES(pilihan_c),pilihan_d=VALUES(pilihan_d),pilihan_e=VALUES(pilihan_e),
  jawaban_benar=VALUES(jawaban_benar),pembahasan=VALUES(pembahasan),metadata_verifikasi=VALUES(metadata_verifikasi),aktif=1;

DROP TEMPORARY TABLE seed_low_items;
DROP TEMPORARY TABLE seed_numbers;
COMMIT;

