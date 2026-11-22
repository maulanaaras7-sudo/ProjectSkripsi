-- Modul contoh tingkat tinggi: 50 soal scaffolding/HOTS.
SET NAMES utf8mb4;
USE fungsiverse;
START TRANSACTION;

UPDATE contoh_soal SET aktif=0
WHERE tingkat='tinggi' AND kode_contoh NOT REGEXP '^CON-T-[0-9]{3}$';

DROP TEMPORARY TABLE IF EXISTS seed_numbers;
CREATE TEMPORARY TABLE seed_numbers (n INT PRIMARY KEY);
INSERT INTO seed_numbers (n) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20);

DROP TEMPORARY TABLE IF EXISTS seed_high_examples;
CREATE TEMPORARY TABLE seed_high_examples (
 seq INT PRIMARY KEY, kode VARCHAR(50), sub_materi VARCHAR(120), tujuan TEXT, pertanyaan TEXT,
 benar VARCHAR(255), salah_1 VARCHAR(255), salah_2 VARCHAR(255), salah_3 VARCHAR(255), salah_4 VARCHAR(255),
 hint_1 TEXT, hint_2 TEXT, pembahasan TEXT,
 umpan_1 TEXT, umpan_2 TEXT, umpan_3 TEXT, umpan_4 TEXT, metadata JSON
);

-- 1-4: komposisi tiga fungsi.
INSERT INTO seed_high_examples
SELECT n,CONCAT('CON-T-',LPAD(n,3,'0')),'notasi_komposisi','Menganalisis urutan komposisi tiga fungsi.',
 CONCAT('Transformasi h dilakukan pertama, g kedua, dan f terakhir pada contoh ',n,'. Notasinya ...'),
 '(f o g o h)(x)','(h o g o f)(x)','(g o f o h)(x)','f(x)+g(x)+h(x)','(f o h o g)(x)',
 'Tuliskan proses dari fungsi terakhir menuju fungsi pertama.','Fungsi pertama yang bekerja berada paling kanan.',
 'Urutannya adalah f(g(h(x))), sehingga notasinya (f o g o h)(x).',
 'Urutannya terbalik seluruhnya.','Posisi f dan g tertukar.','Komposisi bukan penjumlahan fungsi.','Posisi g dan h tertukar.',
 JSON_OBJECT('kind','literal','expected','(f o g o h)(x)')
FROM seed_numbers WHERE n<=4;

-- 5-8: evaluasi fungsi pecahan linear.
INSERT INTO seed_high_examples
SELECT 4+n,CONCAT('CON-T-',LPAD(4+n,3,'0')),'nilai_dan_rumus_komposisi','Menghitung nilai fungsi pecahan linear.',
 CONCAT('Untuk F(x)=(',a,'x+',b,')/(x+1), tentukan F(',xv,').'),
 CAST(v AS CHAR),CAST(v+1 AS CHAR),CAST(v-1 AS CHAR),CAST(-v AS CHAR),CONCAT(v,'/',xv+1),
 'Hitung pembilang dan penyebut secara terpisah.','Pastikan seluruh pembilang dibagi oleh x+1.',
 CONCAT('Pembilang=',v*(xv+1),', penyebut=',xv+1,'. Jadi F(',xv,')=',v,'.'),
 'Kelebihan satu; sederhanakan pecahan sampai selesai.','Kekurangan satu; hitung ulang pembilang.',
 'Tanda hasil tidak berubah karena pembilang dan penyebut positif.','Pecahan ini belum disederhanakan dengan benar.',
 JSON_OBJECT('kind','rational_value','a',a,'b',b,'c',1,'d',1,'x',xv)
FROM (
 SELECT n,2+MOD(n,3) a,1+MOD(n,2) t,n+2 xv,
  (2+MOD(n,3))+(n+3)*(1+MOD(n,2)) b,(2+MOD(n,3))+(1+MOD(n,2)) v
 FROM seed_numbers WHERE n<=4
) p;

-- 9-12: rumus komposisi linear-kuadrat.
INSERT INTO seed_high_examples
SELECT 8+n,CONCAT('CON-T-',LPAD(8+n,3,'0')),'nilai_dan_rumus_komposisi','Mengembangkan komposisi fungsi kuadrat dan linear.',
 CONCAT('Jika f(x)=x^2+',b,' dan g(x)=',c,'x+',d,', tentukan (f o g)(x).'),
 CONCAT(qcoef,'x^2+',lcoef,'x+',constantv),CONCAT(qcoef,'x^2+',lcoef,'x+',constantv+1),
 CONCAT(c,'x^2+',lcoef,'x+',constantv),CONCAT(qcoef,'x^2+',lcoef+1,'x+',constantv),CONCAT(qcoef,'x^2+',lcoef,'x+',b),
 'Substitusikan seluruh g(x) ke tempat x pada f.','Gunakan (cx+d)^2=c^2x^2+2cdx+d^2.',
 CONCAT('(f o g)(x)=(',c,'x+',d,')^2+',b,'=',qcoef,'x^2+',lcoef,'x+',constantv,'.'),
 'Konstanta akhir kelebihan satu.','Koefisien x^2 belum dikuadratkan.','Suku tengah 2cdx kurang satu.','Konstanta d^2 belum ditambahkan.',
 JSON_OBJECT('kind','compose_quadratic_formula','b',b,'c',c,'d',d)
FROM (
 SELECT n,n+1 b,2+MOD(n,2) c,n+1 d,POW(2+MOD(n,2),2) qcoef,
  2*(2+MOD(n,2))*(n+1) lcoef,POW(n+1,2)+n+1 constantv
 FROM seed_numbers WHERE n<=4
) p;

-- 13-17: mencari fungsi dalam.
INSERT INTO seed_high_examples
SELECT 12+n,CONCAT('CON-T-',LPAD(12+n,3,'0')),'menentukan_fungsi_penyusun','Menentukan fungsi linear penyusun melalui sistem koefisien.',
 CONCAT('Jika f(x)=',a,'x+',b,' dan (f o g)(x)=',pcoef,'x+',q,', tentukan g(x).'),
 CONCAT(dcoef,'x+',c),CONCAT(dcoef,'x+',c+1),CONCAT(dcoef+1,'x+',c),CONCAT(dcoef-1,'x+',c),CONCAT(dcoef,'x+',c-1),
 'Misalkan g(x)=dx+c.','Bandingkan koefisien x dan konstanta pada a(dx+c)+b.',
 CONCAT('ad=',pcoef,' memberi d=',dcoef,'. Lalu ac+b=',q,' memberi c=',c,'.'),
 'Konstanta terlalu besar satu.','Koefisien terlalu besar satu.','Koefisien terlalu kecil satu.','Konstanta terlalu kecil satu.',
 JSON_OBJECT('kind','recover_inner_linear','a',a,'b',b,'p',pcoef,'q',q)
FROM (
 SELECT n,2+MOD(n,3) a,n+1 b,3+MOD(n,3) dcoef,n+2 c,
  (2+MOD(n,3))*(3+MOD(n,3)) pcoef,(2+MOD(n,3))*(n+2)+n+1 q
 FROM seed_numbers WHERE n<=5
) p;

-- 18-22: evaluasi sifat komposisi.
INSERT INTO seed_high_examples
SELECT 17+n,CONCAT('CON-T-',LPAD(17+n,3,'0')),'sifat_komposisi','Mengevaluasi sifat komposisi dan invers.',
 CONCAT('Pernyataan yang selalu benar pada contoh ',n,' adalah ...'),
 '(f o g) o h = f o (g o h)','f o g = g o f','(f o g)^-1 = f^-1 o g^-1','f o f^-1 = f','f o I = I',
 'Pisahkan sifat asosiatif dari komutatif.','Pengelompokan boleh berubah, tetapi urutan tidak.',
 'Komposisi bersifat asosiatif: (f o g) o h=f o (g o h).',
 'Komposisi tidak selalu komutatif.','Invers komposisi harus membalik urutan.','Komposisi dengan invers menghasilkan identitas.','Komposisi dengan identitas menghasilkan f.',
 JSON_OBJECT('kind','literal','expected','(f o g) o h = f o (g o h)')
FROM seed_numbers WHERE n<=5;

-- 23-27: syarat invers pecahan linear.
INSERT INTO seed_high_examples
SELECT 22+n,CONCAT('CON-T-',LPAD(22+n,3,'0')),'konsep_dan_syarat_invers','Menganalisis determinan fungsi pecahan linear.',
 CONCAT('Untuk f(x)=(',a,'x+',b,')/(x+1), fungsi tidak konstan jika ...'),
 CONCAT(a,'-',b,' tidak sama dengan 0'),CONCAT(a,'-',b,' sama dengan 0'),'penyebut boleh nol','domain tidak perlu dibatasi','pembilang sama dengan penyebut',
 'Gunakan syarat ad-bc tidak nol untuk (ax+b)/(cx+d).','Di sini c=1 dan d=1.',
 CONCAT('Determinan ad-bc=',a,'-',b,'. Agar fungsi tidak konstan dan memiliki invers, nilainya harus tidak nol.'),
 'Nilai nol justru membuat pembilang sebanding dengan penyebut.','Penyebut nol tidak termasuk domain.','Domain harus mengecualikan x=-1.','Pembilang yang sama membuat fungsi konstan.',
 JSON_OBJECT('kind','literal','expected',CONCAT(a,'-',b,' tidak sama dengan 0'))
FROM (SELECT n,2+MOD(n,3) a,7+n b FROM seed_numbers WHERE n<=5) p;

-- 28-31: invers fungsi pecahan linear.
INSERT INTO seed_high_examples
SELECT 27+n,CONCAT('CON-T-',LPAD(27+n,3,'0')),'rumus_dan_nilai_invers','Menurunkan invers fungsi pecahan linear.',
 CONCAT('Jika f(x)=(',a,'x+',b,')/(x+1), tentukan f^-1(x).'),
 CONCAT('(',b,'-1x)/(1x-',a,')'),CONCAT('(1x-',b,')/(1x-',a,')'),CONCAT('(',b,'+1x)/(1x-',a,')'),
 CONCAT('(',b,'-1x)/(1x+',a,')'),CONCAT('(',b,'-1x)/(',a,'x-1)'),
 'Tetapkan y=(ax+b)/(x+1), lalu kumpulkan semua suku yang mengandung x.','Dari yx+y=ax+b, pindahkan menjadi x(y-a)=b-y.',
 CONCAT('x=(b-y)/(y-a). Setelah mengganti y dengan x, f^-1(x)=(',b,'-x)/(x-',a,').'),
 'Tanda pembilang terbalik.','Suku y pada pembilang seharusnya dikurangkan.','Tanda konstanta penyebut salah.','Koefisien pada penyebut berasal dari y-a, bukan ay-1.',
 JSON_OBJECT('kind','inverse_fractional_formula','a',a,'b',b,'c',1,'d',1)
FROM (SELECT n,2+MOD(n,3) a,(2+MOD(n,3))+n+1 b FROM seed_numbers WHERE n<=4) p;

-- 32-35: invers kuadrat berdomain terbatas.
INSERT INTO seed_high_examples
SELECT 31+n,CONCAT('CON-T-',LPAD(31+n,3,'0')),'rumus_dan_nilai_invers','Memilih cabang invers kuadrat sesuai domain.',
 CONCAT('Untuk f(x)=(x-',h,')^2+',k,' dengan x>=',h,', hitung f^-1(',outputv,').'),
 CAST(ans AS CHAR),CAST(ans+1 AS CHAR),CAST(ans-1 AS CHAR),CAST(-ans AS CHAR),CAST(ans+2 AS CHAR),
 CONCAT('Gunakan akar positif karena x>=',h,'.'),CONCAT('Rumusnya x=',h,'+sqrt(y-',k,').'),
 CONCAT('x=',h,'+sqrt(',outputv,'-',k,')=',h,'+',rootv,'=',ans,'.'),
 'Pergeseran horizontal ditambahkan dua kali.','Pergeseran horizontal belum dihitung tepat.','Cabang negatif tidak sesuai domain.','Akar kuadratnya terlalu besar dua.',
 JSON_OBJECT('kind','inverse_quadratic_value','h',h,'k',k,'output',outputv)
FROM (
 SELECT n,n h,n+2 k,n+3 rootv,2*n+3 ans,POW(n+3,2)+n+2 outputv FROM seed_numbers WHERE n<=4
) p;

-- 36-41: nilai invers komposisi.
INSERT INTO seed_high_examples
SELECT 35+n,CONCAT('CON-T-',LPAD(35+n,3,'0')),'invers_komposisi','Memulihkan input melalui invers komposisi dua fungsi.',
 CONCAT('f(x)=',a,'x+',b,' dan g(x)=',c,'x+',d,'. Jika (f o g)(',inputv,')=',outputv,', nilai (f o g)^-1(',outputv,') adalah ...'),
 CAST(inputv AS CHAR),CAST(inputv+1 AS CHAR),CAST(inputv-1 AS CHAR),CAST(inputv+2 AS CHAR),CAST(inputv-2 AS CHAR),
 'Invers komposisi mengembalikan output ke input asal.','Balik f lebih dahulu, lalu g: g^-1 o f^-1.',
 CONCAT('Karena (f o g) memetakan ',inputv,' ke ',outputv,', inversnya memetakan ',outputv,' kembali ke ',inputv,'.'),
 'Nilai satu terlalu besar.','Nilai satu terlalu kecil.','Nilai dua terlalu besar.','Nilai dua terlalu kecil.',
 JSON_OBJECT('kind','inverse_composition_value','a',a,'b',b,'c',c,'d',d,'output',outputv)
FROM (
 SELECT n,2+MOD(n,2) a,n+1 b,2+MOD(n,3) c,1+MOD(n,2) d,n+1 inputv,
  (2+MOD(n,2))*((2+MOD(n,3))*(n+1)+(1+MOD(n,2)))+n+1 outputv
 FROM seed_numbers WHERE n<=6
) p;

-- 42-45: grafik invers.
INSERT INTO seed_high_examples
SELECT 41+n,CONCAT('CON-T-',LPAD(41+n,3,'0')),'grafik_fungsi_dan_invers','Menganalisis pasangan titik pada grafik invers.',
 CONCAT('Jika grafik fungsi satu-satu f melalui (',p,',',q,'), grafik f^-1 melalui ...'),
 CONCAT('(',q,',',p,')'),CONCAT('(',p,',',q,')'),CONCAT('(',-q,',',-p,')'),CONCAT('(',q,',',-p,')'),CONCAT('(',-q,',',p,')'),
 'Gunakan pencerminan terhadap y=x.','Pencerminan ini menukar koordinat tanpa mengubah tanda.',
 CONCAT('Titik (',p,',',q,') dicerminkan menjadi (',q,',',p,').'),
 'Koordinat belum ditukar.','Ini pencerminan terhadap titik asal.','Tanda kedua tidak perlu berubah.','Tanda pertama tidak perlu berubah.',
 JSON_OBJECT('kind','point_swap','p',p,'q',q)
FROM (SELECT n,n+3 p,5*n+2 q FROM seed_numbers WHERE n<=4) p;

-- 46-50: masalah balik/HOTS.
INSERT INTO seed_high_examples
SELECT 45+n,CONCAT('CON-T-',LPAD(45+n,3,'0')),'kontekstual','Menggunakan invers komposisi dalam masalah kontekstual.',
 CONCAT('Diberikan fungsi H(x)=',a,'(x+',c,')+',b,'. Jika H(x)=',outputv,', nilai x adalah ...'),
 CAST(inputv AS CHAR),CAST(inputv+1 AS CHAR),CAST(inputv-1 AS CHAR),CAST(inputv+2 AS CHAR),CAST(inputv-2 AS CHAR),
 'Mulai dari hasil akhir dan batalkan operasi terakhir.','Urutan baliknya: kurangi b, bagi a, lalu kurangi c.',
 CONCAT('(',outputv,'-',b,')/',a,'-',c,'=',inputv,'.'),
 'Satu terlalu besar; operasi penambahan awal belum dibatalkan tepat.','Satu terlalu kecil; cek pembagian setelah mengurangi biaya akhir.',
 'Dua terlalu besar; jangan membalik operasi dalam urutan semula.','Dua terlalu kecil; invers harus membalik urutan seluruh proses.',
 JSON_OBJECT('kind','contextual_reverse_affine','a',a,'b',b,'c',c,'output',outputv)
FROM (
 SELECT n,2+MOD(n,3) a,n+1 b,2+MOD(n,3) c,n+5 inputv,
  (2+MOD(n,3))*(n+5+2+MOD(n,3))+n+1 outputv
 FROM seed_numbers WHERE n<=5
) p;

INSERT INTO contoh_soal
(kode_contoh,tingkat,urutan,sub_materi,capaian_pembelajaran,tujuan_pembelajaran,
 pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,
 hint_1,hint_2,pembahasan,feedback_salah,metadata_verifikasi,aktif)
SELECT kode,'tinggi',seq,sub_materi,
 'Pada akhir Fase F, peserta didik mampu menerapkan operasi komposisi dan invers fungsi untuk menyelesaikan masalah.',
 tujuan,pertanyaan,
 ELT(MOD(0-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(1-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(2-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(3-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(4-MOD(seq-1,5)+5,5)+1,benar,salah_1,salah_2,salah_3,salah_4),
 ELT(MOD(seq-1,5)+1,'a','b','c','d','e'),hint_1,hint_2,pembahasan,
 JSON_OBJECT(
  'a',ELT(MOD(0-MOD(seq-1,5)+5,5)+1,'',umpan_1,umpan_2,umpan_3,umpan_4),
  'b',ELT(MOD(1-MOD(seq-1,5)+5,5)+1,'',umpan_1,umpan_2,umpan_3,umpan_4),
  'c',ELT(MOD(2-MOD(seq-1,5)+5,5)+1,'',umpan_1,umpan_2,umpan_3,umpan_4),
  'd',ELT(MOD(3-MOD(seq-1,5)+5,5)+1,'',umpan_1,umpan_2,umpan_3,umpan_4),
  'e',ELT(MOD(4-MOD(seq-1,5)+5,5)+1,'',umpan_1,umpan_2,umpan_3,umpan_4)
 ),metadata,1
FROM seed_high_examples
ON DUPLICATE KEY UPDATE
 urutan=VALUES(urutan),sub_materi=VALUES(sub_materi),capaian_pembelajaran=VALUES(capaian_pembelajaran),
 tujuan_pembelajaran=VALUES(tujuan_pembelajaran),pertanyaan=VALUES(pertanyaan),pilihan_a=VALUES(pilihan_a),
 pilihan_b=VALUES(pilihan_b),pilihan_c=VALUES(pilihan_c),pilihan_d=VALUES(pilihan_d),pilihan_e=VALUES(pilihan_e),
 jawaban_benar=VALUES(jawaban_benar),hint_1=VALUES(hint_1),hint_2=VALUES(hint_2),pembahasan=VALUES(pembahasan),
 feedback_salah=VALUES(feedback_salah),metadata_verifikasi=VALUES(metadata_verifikasi),aktif=1;

DROP TEMPORARY TABLE seed_high_examples;
DROP TEMPORARY TABLE seed_numbers;
COMMIT;
