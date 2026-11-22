-- Bank latihan tingkat menengah: 150 soal Kurikulum Merdeka Fase F.
-- Fokus: proses dua langkah atau lebih, linear-kuadrat, sifat komposisi,
-- invers berdomain terbatas, dan penerapan kontekstual.
SET NAMES utf8mb4;
USE fungsiverse;

START TRANSACTION;

UPDATE soal SET aktif=0
WHERE jenis='latihan' AND tingkat_kesulitan='sedang'
  AND (kode_soal IS NULL OR kode_soal NOT REGEXP '^LAT-M-[0-9]{3}$');

DROP TEMPORARY TABLE IF EXISTS seed_numbers;
CREATE TEMPORARY TABLE seed_numbers (n INT PRIMARY KEY);
INSERT INTO seed_numbers (n) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
(21),(22),(23),(24),(25),(26),(27),(28),(29),(30);

DROP TEMPORARY TABLE IF EXISTS seed_medium_items;
CREATE TEMPORARY TABLE seed_medium_items (
 seq INT PRIMARY KEY, kode VARCHAR(50), sub_materi VARCHAR(120), tujuan TEXT,
 pertanyaan TEXT, benar VARCHAR(255), salah_1 VARCHAR(255), salah_2 VARCHAR(255),
 salah_3 VARCHAR(255), salah_4 VARCHAR(255), pembahasan TEXT, metadata JSON
);

-- 1-12: notasi dan urutan substitusi pada komposisi.
INSERT INTO seed_medium_items
SELECT n,CONCAT('LAT-M-',LPAD(n,3,'0')),'notasi_komposisi',
 'Menafsirkan urutan operasi pada komposisi fungsi linear dan kuadrat.',
 CONCAT('Diberikan f(x)=x^2+',n,' dan g(x)=',2+MOD(n,4),'x-',1+MOD(n,3),'. Bentuk yang harus dihitung untuk (g o f)(x) adalah ...'),
 'g(f(x))','f(g(x))','g(x)+f(x)','g(x)f(x)','f(x)-g(x)',
 '(g o f)(x) berarti f dikerjakan lebih dahulu, kemudian hasilnya dimasukkan ke g: g(f(x)).',
 JSON_OBJECT('kind','literal','expected','g(f(x))')
FROM seed_numbers WHERE n<=12;

-- 13-32: nilai komposisi linear-kuadrat.
INSERT INTO seed_medium_items
SELECT 12+n,CONCAT('LAT-M-',LPAD(12+n,3,'0')),'nilai_dan_rumus_komposisi',
 'Menghitung nilai komposisi fungsi linear dan kuadrat dalam dua tahap.',
 CONCAT('Jika f(x)=x^2+',b,' dan g(x)=x+',c,', nilai (f o g)(',xv,') adalah ...'),
 CAST(v AS CHAR),CAST(v+1 AS CHAR),CAST(v-1 AS CHAR),CAST(v+2 AS CHAR),CAST(v-2 AS CHAR),
 CONCAT('g(',xv,')=',xv+c,'. Maka f(g(',xv,'))=(',xv+c,')^2+',b,'=',v,'.'),
 JSON_OBJECT('kind','compose_quadratic_value','b',b,'c',c,'x',xv)
FROM (
 SELECT n,1+MOD(n,7) b,1+MOD(n,4) c,1+MOD(n-1,8) xv,
        POW(1+MOD(n-1,8)+1+MOD(n,4),2)+(1+MOD(n,7)) v
 FROM seed_numbers WHERE n<=20
) p;

-- 33-44: rumus komposisi dua fungsi linear.
INSERT INTO seed_medium_items
SELECT 32+n,CONCAT('LAT-M-',LPAD(32+n,3,'0')),'nilai_dan_rumus_komposisi',
 'Menentukan rumus komposisi dua fungsi linear.',
 CONCAT('Jika f(x)=',a,'x+',b,' dan g(x)=',c,'x+',d,', maka (f o g)(x)=...'),
 CONCAT(ac,'x+',constantv),CONCAT(ac,'x+',constantv+1),CONCAT(a+c,'x+',constantv),
 CONCAT(ac,'x+',b+d),CONCAT(a*c+1,'x+',constantv),
 CONCAT('f(g(x))=',a,'(',c,'x+',d,')+',b,'=',ac,'x+',constantv,'.'),
 JSON_OBJECT('kind','compose_linear_formula','a',a,'b',b,'c',c,'d',d)
FROM (
 SELECT n,2+MOD(n,3) a,1+MOD(n,5) b,2+MOD(n+1,3) c,1+MOD(n,4) d,
        (2+MOD(n,3))*(2+MOD(n+1,3)) ac,
        (2+MOD(n,3))*(1+MOD(n,4))+(1+MOD(n,5)) constantv
 FROM seed_numbers WHERE n<=12
) p;

-- 45-60: menentukan fungsi dalam dari komposisi.
INSERT INTO seed_medium_items
SELECT 44+n,CONCAT('LAT-M-',LPAD(44+n,3,'0')),'menentukan_fungsi_penyusun',
 'Menentukan fungsi linear bagian dalam dari fungsi luar dan komposisinya.',
 CONCAT('Diketahui f(x)=',a,'x+',b,' dan (f o g)(x)=',pcoef,'x+',q,'. Fungsi g(x) adalah ...'),
 CONCAT(dcoef,'x+',c),CONCAT(dcoef,'x+',c+1),CONCAT(dcoef+1,'x+',c),
 CONCAT(dcoef,'x+',c+2),CONCAT(dcoef+2,'x+',c),
 CONCAT('Misalkan g(x)=dx+c. Dari ',a,'d=',pcoef,' diperoleh d=',dcoef,
        ', dan ',a,'c+',b,'=',q,' memberi c=',c,'.'),
 JSON_OBJECT('kind','recover_inner_linear','a',a,'b',b,'p',pcoef,'q',q)
FROM (
 SELECT n,2+MOD(n,3) a,1+MOD(n,5) b,2+MOD(n,4) dcoef,1+MOD(n,6) c,
        (2+MOD(n,3))*(2+MOD(n,4)) pcoef,
        (2+MOD(n,3))*(1+MOD(n,6))+(1+MOD(n,5)) q
 FROM seed_numbers WHERE n<=16
) p;

-- 61-76: sifat asosiatif, identitas, dan tidak komutatif.
INSERT INTO seed_medium_items
SELECT 60+n,CONCAT('LAT-M-',LPAD(60+n,3,'0')),'sifat_komposisi',
 'Menerapkan sifat asosiatif dan identitas pada komposisi fungsi.',
 CONCAT('Untuk fungsi f, g, h dan identitas I(x)=x, pernyataan yang benar pada kasus ',n,' adalah ...'),
 CASE MOD(n,2) WHEN 0 THEN '(f o g) o h = f o (g o h)' ELSE 'f o I = I o f = f' END,
 'f o g = g o f untuk semua f dan g','(f o g) o h = g o (f o h)',
 'f o I = I','I o f = I',
 CASE MOD(n,2) WHEN 0
   THEN 'Komposisi fungsi bersifat asosiatif, sehingga pengelompokan dapat diubah tanpa mengubah urutan.'
   ELSE 'Fungsi identitas tidak mengubah masukan, sehingga dikomposisikan di kiri atau kanan tetap menghasilkan f.' END,
 JSON_OBJECT('kind','literal','expected',CASE MOD(n,2) WHEN 0 THEN '(f o g) o h = f o (g o h)' ELSE 'f o I = I o f = f' END)
FROM seed_numbers WHERE n<=16;

-- 77-92: syarat invers dan pembatasan domain kuadrat.
INSERT INTO seed_medium_items
SELECT 76+n,CONCAT('LAT-M-',LPAD(76+n,3,'0')),'konsep_dan_syarat_invers',
 'Menganalisis pembatasan domain agar fungsi kuadrat mempunyai invers.',
 CONCAT('Fungsi f(x)=(x-',h,')^2+',k,' akan mempunyai invers jika domainnya dibatasi menjadi ...'),
 CONCAT('x>=',h),CONCAT('semua bilangan real'),CONCAT('x!=',h),CONCAT('x<',h,' atau x>',h),CONCAT('x=',h),
 CONCAT('Pada interval x>=',h,' fungsi hanya mengambil cabang naik sehingga satu-satu dan mempunyai invers.'),
 JSON_OBJECT('kind','literal','expected',CONCAT('x>=',h))
FROM (SELECT n,MOD(n,5) h,1+MOD(n,6) k FROM seed_numbers WHERE n<=16) p;

-- 93-108: rumus invers fungsi linear.
INSERT INTO seed_medium_items
SELECT 92+n,CONCAT('LAT-M-',LPAD(92+n,3,'0')),'rumus_dan_nilai_invers',
 'Menentukan rumus invers fungsi linear dengan manipulasi aljabar.',
 CONCAT('Jika f(x)=',a,'x+',b,', rumus f^-1(x) adalah ...'),
 CONCAT('(x-',b,')/',a),CONCAT('(x+',b,')/',a),CONCAT(a,'x-',b),
 CONCAT('(x-',b,')*',a),CONCAT('1/(',a,'x+',b,')'),
 CONCAT('Dari y=',a,'x+',b,' diperoleh x=(y-',b,')/',a,'. Jadi f^-1(x)=(x-',b,')/',a,'.'),
 JSON_OBJECT('kind','inverse_linear_formula','a',a,'b',b)
FROM (SELECT n,2+MOD(n,5) a,2+n b FROM seed_numbers WHERE n<=16) p;

-- 109-116: nilai invers fungsi kuadrat dengan domain terbatas.
INSERT INTO seed_medium_items
SELECT 108+n,CONCAT('LAT-M-',LPAD(108+n,3,'0')),'rumus_dan_nilai_invers',
 'Menentukan nilai invers fungsi kuadrat pada domain yang dibatasi.',
 CONCAT('Diberikan f(x)=(x-',h,')^2+',k,' dengan domain x>=',h,'. Nilai f^-1(',outputv,') adalah ...'),
 CAST(ans AS CHAR),CAST(ans+1 AS CHAR),CAST(ans-1 AS CHAR),CAST(ans+2 AS CHAR),CAST(ans-2 AS CHAR),
 CONCAT('Karena y=(x-',h,')^2+',k,' dan x>=',h,', maka x=',h,'+sqrt(y-',k,'). Untuk y=',outputv,' diperoleh x=',ans,'.'),
 JSON_OBJECT('kind','inverse_quadratic_value','h',h,'k',k,'output',outputv)
FROM (
 SELECT n,MOD(n,4) h,1+MOD(n,5) k,2+MOD(n,5) rootv,
        MOD(n,4)+2+MOD(n,5) ans,
        POW(2+MOD(n,5),2)+1+MOD(n,5) outputv
 FROM seed_numbers WHERE n<=8
) p;

-- 117-132: invers dari komposisi.
INSERT INTO seed_medium_items
SELECT 116+n,CONCAT('LAT-M-',LPAD(116+n,3,'0')),'invers_komposisi',
 'Menentukan urutan pembatalan pada invers komposisi tiga langkah.',
 CONCAT('Jika f, g, dan h bijektif, bentuk (f o g o h)^-1 pada soal ',n,' adalah ...'),
 'h^-1 o g^-1 o f^-1','f^-1 o g^-1 o h^-1','h^-1 o f^-1 o g^-1',
 'f o g o h','h o g o f',
 'Invers komposisi membalik setiap fungsi sekaligus seluruh urutannya: (f o g o h)^-1=h^-1 o g^-1 o f^-1.',
 JSON_OBJECT('kind','literal','expected','h^-1 o g^-1 o f^-1')
FROM seed_numbers WHERE n<=16;

-- 133-140: grafik invers dan simetri y=x.
INSERT INTO seed_medium_items
SELECT 132+n,CONCAT('LAT-M-',LPAD(132+n,3,'0')),'grafik_fungsi_dan_invers',
 'Menganalisis hubungan titik pada grafik fungsi dan inversnya.',
 CONCAT('Grafik y=f(x) melalui titik (',p,',',q,'). Grafik inversnya melalui titik ...'),
 CONCAT('(',q,',',p,')'),CONCAT('(',p,',',q,')'),CONCAT('(',-p,',',q,')'),
 CONCAT('(',p,',',-q,')'),CONCAT('(',-q,',',-p,')'),
 CONCAT('Pencerminan terhadap y=x menukar koordinat, sehingga (',p,',',q,') menjadi (',q,',',p,').'),
 JSON_OBJECT('kind','point_swap','p',p,'q',q)
FROM (SELECT n,n+1 p,3*n+1 q FROM seed_numbers WHERE n<=8) p;

-- 141-150: masalah kontekstual tiga operasi.
INSERT INTO seed_medium_items
SELECT 140+n,CONCAT('LAT-M-',LPAD(140+n,3,'0')),'kontekstual',
 'Menyelesaikan masalah kontekstual melalui komposisi fungsi bertahap.',
 CONCAT('Total harga suatu paket dimodelkan oleh T(x)=',a,'(x+',c,')+',b,
        ', dengan x adalah harga awal dalam ribu rupiah. Jika x=',xv,
        ', nilai T(x) adalah ... ribu rupiah.'),
 CAST(v AS CHAR),CAST(v+1 AS CHAR),CAST(v-1 AS CHAR),CAST(v+a AS CHAR),CAST(v-a AS CHAR),
 CONCAT('Ikuti urutan: ',xv,'+',c,'=',xv+c,', kemudian ',a,'(',xv+c,')+',b,'=',v,'.'),
 JSON_OBJECT('kind','contextual_affine','a',a,'b',b,'c',c,'x',xv)
FROM (
 SELECT n,2+MOD(n,3) a,1+MOD(n,5) b,2+MOD(n,4) c,10+n xv,
        (2+MOD(n,3))*(10+n+2+MOD(n,4))+(1+MOD(n,5)) v
 FROM seed_numbers WHERE n<=10
) p;

INSERT INTO soal
(kode_soal,materi_id,jenis,tingkat_kesulitan,sub_materi,capaian_pembelajaran,tujuan_pembelajaran,
 pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,pembahasan,metadata_verifikasi,aktif)
SELECT kode,
 CASE WHEN sub_materi IN ('konsep_dan_syarat_invers','rumus_dan_nilai_invers','invers_komposisi','grafik_fungsi_dan_invers')
      THEN (SELECT id FROM materi WHERE judul='Fungsi Invers' LIMIT 1)
      ELSE (SELECT id FROM materi WHERE judul='Komposisi Fungsi' LIMIT 1) END,
 'latihan','sedang',sub_materi,
 'Pada akhir Fase F, peserta didik mampu menerapkan operasi komposisi dan invers fungsi untuk menyelesaikan masalah.',
 tujuan,pertanyaan,
 ELT(MOD(0-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(1-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(2-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(3-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(4-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(seq-1,5)+1,'a','b','c','d','e'),pembahasan,metadata,1
FROM seed_medium_items
ON DUPLICATE KEY UPDATE
 materi_id=VALUES(materi_id),sub_materi=VALUES(sub_materi),capaian_pembelajaran=VALUES(capaian_pembelajaran),
 tujuan_pembelajaran=VALUES(tujuan_pembelajaran),pertanyaan=VALUES(pertanyaan),pilihan_a=VALUES(pilihan_a),
 pilihan_b=VALUES(pilihan_b),pilihan_c=VALUES(pilihan_c),pilihan_d=VALUES(pilihan_d),pilihan_e=VALUES(pilihan_e),
 jawaban_benar=VALUES(jawaban_benar),pembahasan=VALUES(pembahasan),metadata_verifikasi=VALUES(metadata_verifikasi),aktif=1;

DROP TEMPORARY TABLE seed_medium_items;
DROP TEMPORARY TABLE seed_numbers;
COMMIT;
