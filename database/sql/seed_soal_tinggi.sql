-- Bank latihan tingkat tinggi: 150 soal penalaran/HOTS Fase F.
SET NAMES utf8mb4;
USE fungsiverse;
START TRANSACTION;

UPDATE soal SET aktif=0
WHERE jenis='latihan' AND tingkat_kesulitan='tinggi'
  AND (kode_soal IS NULL OR kode_soal NOT REGEXP '^LAT-T-[0-9]{3}$');

DROP TEMPORARY TABLE IF EXISTS seed_numbers;
CREATE TEMPORARY TABLE seed_numbers (n INT PRIMARY KEY);
INSERT INTO seed_numbers (n) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
(21),(22),(23),(24),(25),(26),(27),(28),(29),(30);

DROP TEMPORARY TABLE IF EXISTS seed_high_items;
CREATE TEMPORARY TABLE seed_high_items (
 seq INT PRIMARY KEY, kode VARCHAR(50), sub_materi VARCHAR(120), tujuan TEXT, pertanyaan TEXT,
 benar VARCHAR(255), salah_1 VARCHAR(255), salah_2 VARCHAR(255), salah_3 VARCHAR(255), salah_4 VARCHAR(255),
 pembahasan TEXT, metadata JSON
);

-- 1-10: analisis urutan komposisi bertingkat.
INSERT INTO seed_high_items
SELECT n,CONCAT('LAT-T-',LPAD(n,3,'0')),'notasi_komposisi',
 'Menganalisis urutan pengerjaan komposisi tiga fungsi.',
 CONCAT('Jika transformasi h dilakukan pertama, dilanjutkan g, lalu f pada kasus ',n,', notasi hasil akhirnya adalah ...'),
 '(f o g o h)(x)','(h o g o f)(x)','(g o f o h)(x)','f(x)+g(x)+h(x)','(f o h o g)(x)',
 'Fungsi yang dikerjakan pertama ditulis paling kanan: f(g(h(x)))=(f o g o h)(x).',
 JSON_OBJECT('kind','literal','expected','(f o g o h)(x)')
FROM seed_numbers WHERE n<=10;

-- 11-22: nilai fungsi pecahan linear.
INSERT INTO seed_high_items
SELECT 10+n,CONCAT('LAT-T-',LPAD(10+n,3,'0')),'nilai_dan_rumus_komposisi',
 'Menghitung nilai fungsi pecahan linear dengan memperhatikan penyebut.',
 CONCAT('Untuk F(x)=(',a,'x+',b,')/(x+1), nilai F(',xv,') adalah ...'),
 CAST(v AS CHAR),CAST(v+1 AS CHAR),CAST(v-1 AS CHAR),CAST(-v AS CHAR),CONCAT(v,'/',xv+1),
 CONCAT('Pembilang=',a,'(',xv,')+',b,'=',v*(xv+1),' dan penyebut=',xv+1,', sehingga nilainya ',v,'.'),
 JSON_OBJECT('kind','rational_value','a',a,'b',b,'c',1,'d',1,'x',xv)
FROM (
 SELECT n,2+MOD(n,4) a,1+MOD(n,3) t,n+1 xv,
        (2+MOD(n,4))+(n+2)*(1+MOD(n,3)) b,
        (2+MOD(n,4))+(1+MOD(n,3)) v
 FROM seed_numbers WHERE n<=12
) p;

-- 23-34: rumus komposisi linear ke kuadrat.
INSERT INTO seed_high_items
SELECT 22+n,CONCAT('LAT-T-',LPAD(22+n,3,'0')),'nilai_dan_rumus_komposisi',
 'Menurunkan rumus komposisi fungsi kuadrat dan linear.',
 CONCAT('Jika f(x)=x^2+',b,' dan g(x)=',c,'x+',d,', maka (f o g)(x)=...'),
 CONCAT(qcoef,'x^2+',lcoef,'x+',constantv),
 CONCAT(qcoef,'x^2+',lcoef,'x+',constantv+1),
 CONCAT(c,'x^2+',lcoef,'x+',constantv),
 CONCAT(qcoef,'x^2+',lcoef+1,'x+',constantv),
 CONCAT(qcoef,'x^2+',lcoef,'x+',b),
 CONCAT('f(g(x))=(',c,'x+',d,')^2+',b,'=',qcoef,'x^2+',lcoef,'x+',constantv,'.'),
 JSON_OBJECT('kind','compose_quadratic_formula','b',b,'c',c,'d',d)
FROM (
 SELECT n,1+MOD(n,6) b,2+MOD(n,3) c,1+MOD(n,4) d,
        POW(2+MOD(n,3),2) qcoef,2*(2+MOD(n,3))*(1+MOD(n,4)) lcoef,
        POW(1+MOD(n,4),2)+1+MOD(n,6) constantv
 FROM seed_numbers WHERE n<=12
) p;

-- 35-50: menentukan fungsi penyusun linear.
INSERT INTO seed_high_items
SELECT 34+n,CONCAT('LAT-T-',LPAD(34+n,3,'0')),'menentukan_fungsi_penyusun',
 'Menentukan fungsi bagian dalam melalui perbandingan koefisien.',
 CONCAT('Diketahui f(x)=',a,'x+',b,' dan (f o g)(x)=',pcoef,'x+',q,'. Jika g linear, g(x)=...'),
 CONCAT(dcoef,'x+',c),CONCAT(dcoef,'x+',c+1),CONCAT(dcoef+1,'x+',c),
 CONCAT(dcoef-1,'x+',c),CONCAT(dcoef,'x+',c-1),
 CONCAT('Dengan g(x)=dx+c, f(g(x))=',a,'dx+',a,'c+',b,'. Jadi d=',dcoef,' dan c=',c,'.'),
 JSON_OBJECT('kind','recover_inner_linear','a',a,'b',b,'p',pcoef,'q',q)
FROM (
 SELECT n,2+MOD(n,4) a,1+MOD(n,5) b,3+MOD(n,4) dcoef,2+MOD(n,6) c,
        (2+MOD(n,4))*(3+MOD(n,4)) pcoef,
        (2+MOD(n,4))*(2+MOD(n,6))+(1+MOD(n,5)) q
 FROM seed_numbers WHERE n<=16
) p;

-- 51-66: analisis sifat komposisi.
INSERT INTO seed_high_items
SELECT 50+n,CONCAT('LAT-T-',LPAD(50+n,3,'0')),'sifat_komposisi',
 'Mengevaluasi pernyataan tentang sifat komposisi fungsi.',
 CONCAT('Pernyataan yang selalu benar untuk fungsi yang komposisinya terdefinisi pada kasus ',n,' adalah ...'),
 '(f o g) o h = f o (g o h)','f o g = g o f','f o f^-1 = f','f o I = I','(f o g)^-1 = f^-1 o g^-1',
 'Komposisi bersifat asosiatif. Komutatif tidak selalu berlaku, dan invers komposisi harus membalik urutan.',
 JSON_OBJECT('kind','literal','expected','(f o g) o h = f o (g o h)')
FROM seed_numbers WHERE n<=16;

-- 67-82: syarat invers pada fungsi pecahan/kuadrat.
INSERT INTO seed_high_items
SELECT 66+n,CONCAT('LAT-T-',LPAD(66+n,3,'0')),'konsep_dan_syarat_invers',
 'Menganalisis syarat fungsi pecahan linear memiliki invers.',
 CONCAT('Untuk f(x)=(',a,'x+',b,')/(x+1), syarat yang memastikan fungsi tidak konstan dan dapat diinvers adalah ...'),
 CONCAT(a,'-',b,' tidak sama dengan 0'),'penyebut boleh bernilai 0','domain harus semua real tanpa pengecualian',
 CONCAT(a,'-',b,' sama dengan 0'),'pembilang dan penyebut harus sama',
 CONCAT('Determinan ad-bc=',a,'-',b,'. Nilai ini harus tidak nol; domain juga mengecualikan x=-1.'),
 JSON_OBJECT('kind','literal','expected',CONCAT(a,'-',b,' tidak sama dengan 0'))
FROM (SELECT n,2+MOD(n,5) a,8+n b FROM seed_numbers WHERE n<=16) p;

-- 83-98: invers fungsi pecahan linear.
INSERT INTO seed_high_items
SELECT 82+n,CONCAT('LAT-T-',LPAD(82+n,3,'0')),'rumus_dan_nilai_invers',
 'Menentukan invers fungsi pecahan linear menggunakan manipulasi aljabar.',
 CONCAT('Jika f(x)=(',a,'x+',b,')/(x+1), maka f^-1(x)=...'),
 CONCAT('(',b,'-1x)/(1x-',a,')'),CONCAT('(1x-',b,')/(1x-',a,')'),
 CONCAT('(',b,'+1x)/(1x-',a,')'),CONCAT('(',b,'-1x)/(1x+',a,')'),
 CONCAT('(',b,'-1x)/(',a,'x-1)'),
 CONCAT('Dari y=(ax+b)/(x+1): yx+y=ax+b, sehingga x=(b-y)/(y-a). Ganti y dengan x.'),
 JSON_OBJECT('kind','inverse_fractional_formula','a',a,'b',b,'c',1,'d',1)
FROM (SELECT n,2+MOD(n,5) a,(2+MOD(n,5))+n b FROM seed_numbers WHERE n<=16) p;

-- 99-106: invers kuadrat dengan domain terbatas.
INSERT INTO seed_high_items
SELECT 98+n,CONCAT('LAT-T-',LPAD(98+n,3,'0')),'rumus_dan_nilai_invers',
 'Menghitung nilai invers kuadrat dan memilih cabang sesuai domain.',
 CONCAT('Untuk f(x)=(x-',h,')^2+',k,' dengan x>=',h,', nilai f^-1(',outputv,') adalah ...'),
 CAST(ans AS CHAR),CAST(ans+1 AS CHAR),CAST(ans-1 AS CHAR),CAST(-ans AS CHAR),CAST(ans+2 AS CHAR),
 CONCAT('Gunakan x=',h,'+sqrt(y-',k,'). Untuk y=',outputv,', diperoleh x=',h,'+',rootv,'=',ans,'.'),
 JSON_OBJECT('kind','inverse_quadratic_value','h',h,'k',k,'output',outputv)
FROM (
 SELECT n,1+MOD(n,4) h,2+MOD(n,5) k,3+MOD(n,6) rootv,
        1+MOD(n,4)+3+MOD(n,6) ans,POW(3+MOD(n,6),2)+2+MOD(n,5) outputv
 FROM seed_numbers WHERE n<=8
) p;

-- 107-124: nilai invers komposisi dua fungsi linear.
INSERT INTO seed_high_items
SELECT 106+n,CONCAT('LAT-T-',LPAD(106+n,3,'0')),'invers_komposisi',
 'Menggunakan invers komposisi untuk memulihkan masukan awal.',
 CONCAT('Diketahui f(x)=',a,'x+',b,' dan g(x)=',c,'x+',d,'. Jika (f o g)(',inputv,')=',outputv,', maka (f o g)^-1(',outputv,')=...'),
 CAST(inputv AS CHAR),CAST(inputv+1 AS CHAR),CAST(inputv-1 AS CHAR),CAST(inputv+2 AS CHAR),CAST(inputv-2 AS CHAR),
 CONCAT('Invers mengembalikan keluaran ',outputv,' ke masukan awal ',inputv,'. Secara urutan, (f o g)^-1=g^-1 o f^-1.'),
 JSON_OBJECT('kind','inverse_composition_value','a',a,'b',b,'c',c,'d',d,'output',outputv)
FROM (
 SELECT n,2+MOD(n,3) a,1+MOD(n,5) b,2+MOD(n,4) c,1+MOD(n,3) d,n inputv,
        (2+MOD(n,3))*((2+MOD(n,4))*n+(1+MOD(n,3)))+(1+MOD(n,5)) outputv
 FROM seed_numbers WHERE n<=18
) p;

-- 125-134: analisis grafik invers.
INSERT INTO seed_high_items
SELECT 124+n,CONCAT('LAT-T-',LPAD(124+n,3,'0')),'grafik_fungsi_dan_invers',
 'Menganalisis simetri dan pasangan titik grafik fungsi invers.',
 CONCAT('Jika grafik fungsi satu-satu f melalui (',p,',',q,'), titik yang wajib dilalui grafik f^-1 adalah ...'),
 CONCAT('(',q,',',p,')'),CONCAT('(',p,',',q,')'),CONCAT('(',-q,',',-p,')'),
 CONCAT('(',q,',',-p,')'),CONCAT('(',-q,',',p,')'),
 'Grafik f^-1 adalah pencerminan grafik f terhadap y=x, sehingga kedua koordinat ditukar.',
 JSON_OBJECT('kind','point_swap','p',p,'q',q)
FROM (SELECT n,n+2 p,4*n+3 q FROM seed_numbers WHERE n<=10) p;

-- 135-150: HOTS kontekstual, mencari nilai awal dari proses bertahap.
INSERT INTO seed_high_items
SELECT 134+n,CONCAT('LAT-T-',LPAD(134+n,3,'0')),'kontekstual',
 'Memecahkan masalah balik menggunakan invers komposisi.',
 CONCAT('Diberikan fungsi H(x)=',a,'(x+',c,')+',b,
        '. Jika H(x)=',outputv,', nilai x adalah ...'),
 CAST(inputv AS CHAR),CAST(inputv+1 AS CHAR),CAST(inputv-1 AS CHAR),CAST(inputv+2 AS CHAR),CAST(inputv-2 AS CHAR),
 CONCAT('Balik urutan operasi: (',outputv,'-',b,')/',a,'-',c,'=',inputv,'.'),
 JSON_OBJECT('kind','contextual_reverse_affine','a',a,'b',b,'c',c,'output',outputv)
FROM (
 SELECT n,2+MOD(n,4) a,1+MOD(n,5) b,2+MOD(n,4) c,n+4 inputv,
        (2+MOD(n,4))*(n+4+2+MOD(n,4))+(1+MOD(n,5)) outputv
 FROM seed_numbers WHERE n<=16
) p;

INSERT INTO soal
(kode_soal,materi_id,jenis,tingkat_kesulitan,sub_materi,capaian_pembelajaran,tujuan_pembelajaran,
 pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,pembahasan,metadata_verifikasi,aktif)
SELECT kode,
 CASE WHEN sub_materi IN ('konsep_dan_syarat_invers','rumus_dan_nilai_invers','invers_komposisi','grafik_fungsi_dan_invers')
      THEN (SELECT id FROM materi WHERE judul='Fungsi Invers' LIMIT 1)
      ELSE (SELECT id FROM materi WHERE judul='Komposisi Fungsi' LIMIT 1) END,
 'latihan','tinggi',sub_materi,
 'Pada akhir Fase F, peserta didik mampu menerapkan operasi komposisi dan invers fungsi untuk menyelesaikan masalah.',
 tujuan,pertanyaan,
 ELT(MOD(0-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(1-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(2-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(3-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(4-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(seq-1,5)+1,'a','b','c','d','e'),pembahasan,metadata,1
FROM seed_high_items
ON DUPLICATE KEY UPDATE
 materi_id=VALUES(materi_id),sub_materi=VALUES(sub_materi),capaian_pembelajaran=VALUES(capaian_pembelajaran),
 tujuan_pembelajaran=VALUES(tujuan_pembelajaran),pertanyaan=VALUES(pertanyaan),pilihan_a=VALUES(pilihan_a),
 pilihan_b=VALUES(pilihan_b),pilihan_c=VALUES(pilihan_c),pilihan_d=VALUES(pilihan_d),pilihan_e=VALUES(pilihan_e),
 jawaban_benar=VALUES(jawaban_benar),pembahasan=VALUES(pembahasan),metadata_verifikasi=VALUES(metadata_verifikasi),aktif=1;

DROP TEMPORARY TABLE seed_high_items;
DROP TEMPORARY TABLE seed_numbers;
COMMIT;
