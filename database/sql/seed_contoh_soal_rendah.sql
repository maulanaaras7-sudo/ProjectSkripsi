-- Modul contoh tingkat rendah: 50 soal bertahap dengan hint dan feedback.
-- Contoh soal disimpan terpisah dan tidak pernah masuk nilai pretest, latihan,
-- maupun posttest. Kunci diverifikasi oleh tools/verify_question_bank.php.
SET NAMES utf8mb4;
USE fungsiverse;

START TRANSACTION;

UPDATE contoh_soal SET aktif = 0
WHERE tingkat = 'rendah'
  AND kode_contoh NOT REGEXP '^CON-R-[0-9]{3}$';

DROP TEMPORARY TABLE IF EXISTS seed_numbers;
CREATE TEMPORARY TABLE seed_numbers (n INT PRIMARY KEY);
INSERT INTO seed_numbers (n) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),
(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28),(29),(30);

DROP TEMPORARY TABLE IF EXISTS seed_low_examples;
CREATE TEMPORARY TABLE seed_low_examples (
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
  hint_1 TEXT NOT NULL,
  hint_2 TEXT NOT NULL,
  pembahasan TEXT NOT NULL,
  umpan_1 TEXT NOT NULL,
  umpan_2 TEXT NOT NULL,
  umpan_3 TEXT NOT NULL,
  umpan_4 TEXT NOT NULL,
  metadata JSON NOT NULL
);

-- 1-6: membaca urutan notasi komposisi.
INSERT INTO seed_low_examples
SELECT n,CONCAT('CON-R-',LPAD(n,3,'0')),'notasi_komposisi',
       'Mengenali fungsi yang dikerjakan lebih dahulu pada notasi komposisi.',
       CONCAT('Jika f(x)=',1+n,'x+1 dan g(x)=x+',n,', bentuk (f o g)(x) sebelum disederhanakan adalah ...'),
       'f(g(x))','g(f(x))','f(x)+g(x)','f(x)g(x)','f(x)-g(x)',
       'Perhatikan fungsi yang paling dekat dengan x pada notasi komposisi.',
       'Pada (f o g)(x), kerjakan g terlebih dahulu, lalu masukkan hasilnya ke f.',
       '(f o g)(x)=f(g(x)). Huruf di kanan, yaitu g, bekerja lebih dahulu; keluarannya menjadi masukan f.',
       'Urutan tertukar: g(f(x)) adalah (g o f)(x).',
       'Komposisi bukan penjumlahan dua nilai fungsi.',
       'Komposisi berarti substitusi, bukan perkalian fungsi.',
       'Komposisi tidak dibentuk dengan pengurangan fungsi.',
       JSON_OBJECT('kind','literal','expected','f(g(x))')
FROM seed_numbers WHERE n<=6;

-- 7-14: nilai komposisi linear, dibimbing dua tahap.
INSERT INTO seed_low_examples
SELECT 6+n,CONCAT('CON-R-',LPAD(6+n,3,'0')),'nilai_dan_rumus_komposisi',
       'Menghitung nilai komposisi dua fungsi linear secara berurutan.',
       CONCAT('Diketahui f(x)=',a,'x+',b,' dan g(x)=x+',c,'. Nilai (f o g)(',xv,') adalah ...'),
       CAST(v AS CHAR),CAST(v+1 AS CHAR),CAST(v-1 AS CHAR),CAST(v+a AS CHAR),CAST(v-a AS CHAR),
       CONCAT('Mulailah dengan menghitung g(',xv,').'),
       CONCAT('g(',xv,')=',xv+c,'. Substitusikan nilai ini ke f.'),
       CONCAT('g(',xv,')=',xv,'+',c,'=',xv+c,'. Selanjutnya f(',xv+c,')=',a,'(',xv+c,')+',b,'=',v,'.'),
       'Nilainya satu lebih besar; periksa kembali penjumlahan konstanta terakhir.',
       'Nilainya satu lebih kecil; jangan mengurangi konstanta pada f.',
       'Anda mungkin menambahkan koefisien f sekali lagi setelah substitusi.',
       'Anda mungkin mengurangi koefisien f; ikuti operasi pada rumus f apa adanya.',
       JSON_OBJECT('kind','compose_linear_value','a',a,'b',b,'c',c,'x',xv)
FROM (
  SELECT n,2+MOD(n,3) a,1+MOD(n,5) b,1+MOD(n,4) c,n xv,
         (2+MOD(n,3))*(n+1+MOD(n,4))+(1+MOD(n,5)) v
  FROM seed_numbers WHERE n<=8
) p;

-- 15-19: menemukan fungsi luar dari komposisi.
INSERT INTO seed_low_examples
SELECT 14+n,CONCAT('CON-R-',LPAD(14+n,3,'0')),'menentukan_fungsi_penyusun',
       'Menentukan fungsi luar linear ketika komposisi dan fungsi dalam diketahui.',
       CONCAT('Jika g(x)=x+',c,' dan (f o g)(x)=',a,'x+',q,', maka f(x)=...'),
       CONCAT(a,'x+',k),CONCAT(a,'x+',k+1),CONCAT(a,'x+',k+2),CONCAT(a,'x+',k+3),CONCAT(a,'x+',k+4),
       CONCAT('Misalkan f(x)=',a,'x+d. Cari nilai d.'),
       CONCAT('f(g(x))=',a,'(x+',c,')+d=',a,'x+',a*c,'+d.'),
       CONCAT('Samakan konstanta: ',a*c,'+d=',q,', sehingga d=',k,'. Jadi f(x)=',a,'x+',k,'.'),
       'Konstantanya lebih satu; kurangkan kontribusi dari g secara tepat.',
       'Konstantanya lebih dua; ingat konstanta g juga dikalikan koefisien f.',
       'Konstantanya lebih tiga; jangan langsung menyalin konstanta komposisi.',
       'Konstantanya lebih empat; selesaikan persamaan konstanta sebelum memilih.',
       JSON_OBJECT('kind','recover_outer_linear','a',a,'c',c,'q',q)
FROM (
  SELECT n,2+MOD(n,3) a,1+MOD(n,3) c,n+1 k,
         (n+1)+(2+MOD(n,3))*(1+MOD(n,3)) q
  FROM seed_numbers WHERE n<=5
) p;

-- 20-24: sifat komposisi.
INSERT INTO seed_low_examples
SELECT 19+n,CONCAT('CON-R-',LPAD(19+n,3,'0')),'sifat_komposisi',
       'Menjelaskan bahwa komposisi fungsi pada umumnya tidak komutatif.',
       CONCAT('Untuk f(x)=x+',n,' dan g(x)=2x, hasil (f o g)(x)=2x+',n,' sedangkan (g o f)(x)=2x+',2*n,'. Sifat yang tampak adalah ...'),
       'Komposisi tidak komutatif','Komposisi selalu komutatif','f adalah fungsi identitas','g adalah fungsi identitas','Urutan komposisi tidak penting',
       'Bandingkan kedua hasil yang diberikan pada soal.',
       'Jika f o g berbeda dari g o f, pertukaran urutan mengubah hasil.',
       'Karena kedua hasil berbeda, f o g tidak selalu sama dengan g o f. Jadi komposisi fungsi tidak komutatif.',
       'Pernyataan selalu komutatif bertentangan dengan dua hasil yang berbeda.',
       'Fungsi identitas harus memetakan x menjadi x, sedangkan f(x)=x+c.',
       'g(x)=2x bukan fungsi identitas karena mengubah nilai x.',
       'Urutan justru penting karena kedua komposisi menghasilkan konstanta berbeda.',
       JSON_OBJECT('kind','literal','expected','Komposisi tidak komutatif')
FROM seed_numbers WHERE n<=5;

-- 25-29: syarat adanya fungsi invers.
INSERT INTO seed_low_examples
SELECT 24+n,CONCAT('CON-R-',LPAD(24+n,3,'0')),'konsep_dan_syarat_invers',
       'Membedakan fungsi yang satu-satu dan yang tidak satu-satu.',
       IF(n<=3,
          CONCAT('Apakah f(x)=',n+1,'x+',n,' pada bilangan real memiliki fungsi invers?'),
          CONCAT('Apakah f(x)=x^2+',n,' pada seluruh bilangan real memiliki fungsi invers?')),
       IF(n<=3,'Ya, karena fungsi tersebut bijektif','Tidak, karena fungsi tersebut tidak satu-satu'),
       IF(n<=3,'Tidak, karena fungsi linear tidak memiliki invers','Ya, karena semua fungsi mempunyai invers'),
       'Ya, karena invers adalah 1/f(x)','Tidak, karena kodomain selalu kosong','Hanya jika x=0',
       'Uji apakah dua masukan berbeda dapat menghasilkan keluaran yang sama.',
       IF(n<=3,'Gradien fungsi linear ini tidak nol.','Pada fungsi kuadrat, bandingkan keluaran untuk x dan -x.'),
       IF(n<=3,
          'Fungsi linear bergradien tidak nol bersifat satu-satu dan bijektif dari R ke R, sehingga mempunyai invers.',
          'Pada domain seluruh bilangan real, x dan -x memberikan keluaran sama. Fungsi tidak satu-satu, jadi tidak memiliki invers berupa fungsi.'),
       IF(n<=3,'Fungsi linear dengan gradien tidak nol justru memiliki invers.','Fungsi kuadrat pada seluruh R tidak satu-satu.'),
       'Invers fungsi bukan kebalikan nilai 1/f(x).',
       'Kodomain bukan alasan yang tepat; periksa pemetaan satu-satu.',
       'Keberadaan invers tidak ditentukan hanya dari satu nilai x.',
       JSON_OBJECT('kind','literal','expected',IF(n<=3,'Ya, karena fungsi tersebut bijektif','Tidak, karena fungsi tersebut tidak satu-satu'))
FROM seed_numbers WHERE n<=5;

-- 30-33: nilai invers dari pasangan input-output.
INSERT INTO seed_low_examples
SELECT 29+n,CONCAT('CON-R-',LPAD(29+n,3,'0')),'rumus_dan_nilai_invers',
       'Menentukan nilai invers dari hubungan input-output fungsi linear.',
       CONCAT('Diketahui f(x)=',a,'x+',b,' dan f(',inputv,')=',outputv,'. Nilai f^-1(',outputv,') adalah ...'),
       CAST(inputv AS CHAR),CAST(inputv+1 AS CHAR),CAST(inputv-1 AS CHAR),CAST(inputv+2 AS CHAR),CAST(inputv-2 AS CHAR),
       'Fungsi invers membalik arah pasangan input dan output.',
       CONCAT('Jika f(',inputv,')=',outputv,', maka invers memetakan ',outputv,' kembali ke ',inputv,'.'),
       CONCAT('Pasangan f adalah ',inputv,' -> ',outputv,'. Setelah dibalik menjadi f^-1: ',outputv,' -> ',inputv,'.'),
       'Anda memilih satu lebih besar daripada input asal.',
       'Anda memilih satu lebih kecil daripada input asal.',
       'Invers harus mengembalikan tepat ke input semula, bukan dua lebih besar.',
       'Invers harus mengembalikan tepat ke input semula, bukan dua lebih kecil.',
       JSON_OBJECT('kind','inverse_linear_value','input',inputv)
FROM (
  SELECT n,2+MOD(n,3) a,n+1 b,n+1 inputv,(2+MOD(n,3))*(n+1)+(n+1) outputv
  FROM seed_numbers WHERE n<=4
) p;

-- 34-37: rumus invers linear.
INSERT INTO seed_low_examples
SELECT 33+n,CONCAT('CON-R-',LPAD(33+n,3,'0')),'rumus_dan_nilai_invers',
       'Menentukan rumus invers fungsi linear dengan menukar x dan y.',
       CONCAT('Rumus invers dari f(x)=',a,'x+',b,' adalah ...'),
       CONCAT('(x-',b,')/',a),CONCAT('(x+',b,')/',a),CONCAT(a,'x-',b),CONCAT('(x-',b,')*',a),CONCAT('1/(',a,'x+',b,')'),
       CONCAT('Tuliskan y=',a,'x+',b,', lalu selesaikan persamaan itu untuk x.'),
       CONCAT('y-',b,'=',a,'x, sehingga x=(y-',b,')/',a,'.'),
       CONCAT('Dari y=',a,'x+',b,', diperoleh x=(y-',b,')/',a,'. Ganti y dengan x: f^-1(x)=(x-',b,')/',a,'.'),
       'Tanda konstanta salah; konstanta harus dipindah dengan pengurangan.',
       'Koefisien dan konstanta belum diinvers melalui langkah aljabar yang benar.',
       'Setelah mengurangi konstanta, hasil harus dibagi koefisien, bukan dikalikan.',
       'Invers fungsi tidak sama dengan kebalikan 1/f(x).',
       JSON_OBJECT('kind','inverse_linear_formula','a',a,'b',b)
FROM (SELECT n,2+MOD(n,3) a,n+2 b FROM seed_numbers WHERE n<=4) p;

-- 38-42: urutan invers komposisi.
INSERT INTO seed_low_examples
SELECT 37+n,CONCAT('CON-R-',LPAD(37+n,3,'0')),'invers_komposisi',
       'Mengenali pembalikan urutan pada invers komposisi.',
       CONCAT('Untuk fungsi bijektif f(x)=',n+1,'x+1 dan g(x)=x+',n,', bentuk (f o g)^-1 adalah ...'),
       'g^-1 o f^-1','f^-1 o g^-1','f o g','g o f','f^-1 o g',
       'Bayangkan membatalkan dua langkah dalam urutan terbalik.',
       'Jika g dikerjakan dahulu lalu f, pembatalannya adalah f^-1 dahulu lalu g^-1.',
       '(f o g)^-1 membalik tiap fungsi sekaligus urutannya, sehingga hasilnya g^-1 o f^-1.',
       'Urutan invers belum dibalik; pilihan ini adalah invers fungsi secara terpisah dengan urutan salah.',
       'Ini komposisi semula, bukan inversnya.',
       'Urutan ditukar tetapi kedua fungsi belum diinvers.',
       'Hanya f yang diinvers; kedua fungsi harus diinvers dan urutannya dibalik.',
       JSON_OBJECT('kind','literal','expected','g^-1 o f^-1')
FROM seed_numbers WHERE n<=5;

-- 43-46: grafik fungsi dan invers.
INSERT INTO seed_low_examples
SELECT 42+n,CONCAT('CON-R-',LPAD(42+n,3,'0')),'grafik_fungsi_dan_invers',
       'Menentukan titik bayangan pada grafik invers.',
       CONCAT('Jika titik (',p,',',q,') berada pada grafik y=f(x), titik pada y=f^-1(x) adalah ...'),
       CONCAT('(',q,',',p,')'),CONCAT('(',p,',',q,')'),CONCAT('(',-q,',',-p,')'),CONCAT('(',q,',',-p,')'),CONCAT('(',-q,',',p,')'),
       'Grafik fungsi dan invers merupakan pencerminan terhadap garis y=x.',
       'Pencerminan terhadap y=x menukar koordinat x dan y.',
       CONCAT('Tukar koordinat titik: (',p,',',q,') menjadi (',q,',',p,').'),
       'Koordinat belum ditukar; titik ini tetap berada pada grafik asal.',
       'Mengubah kedua tanda adalah pencerminan terhadap titik asal, bukan y=x.',
       'Koordinat memang ditukar, tetapi tanda tidak perlu berubah.',
       'Koordinat ditukar dengan perubahan tanda yang tidak diperlukan.',
       JSON_OBJECT('kind','point_swap','p',p,'q',q)
FROM (SELECT n,n+1 p,2*n+3 q FROM seed_numbers WHERE n<=4) p;

-- 47-50: konteks proses dua tahap.
INSERT INTO seed_low_examples
SELECT 46+n,CONCAT('CON-R-',LPAD(46+n,3,'0')),'kontekstual',
       'Memodelkan proses berurutan sebagai komposisi fungsi.',
       CONCAT('Mesin A menambah bilangan dengan ',c,' dan mesin B mengalikan hasilnya dengan ',a,'. Jika masukan ',xv,' melewati A lalu B, keluarannya ...'),
       CAST(v AS CHAR),CAST(v+1 AS CHAR),CAST(v-1 AS CHAR),CAST(v+a AS CHAR),CAST(v-a AS CHAR),
       'Ikuti mesin sesuai urutan cerita: A lebih dahulu.',
       CONCAT('Setelah A nilainya ',xv,'+',c,'=',xv+c,'. Lalu gunakan hasil itu pada B.'),
       CONCAT('A menghasilkan ',xv+c,'. Mesin B kemudian menghasilkan ',a,' x ',xv+c,'=',v,'.'),
       'Hasil satu lebih besar; periksa operasi perkalian tahap kedua.',
       'Hasil satu lebih kecil; jangan mengurangi hasil tahap pertama.',
       'Anda mungkin menambahkan pengali setelah proses, bukan mengalikannya.',
       'Anda mungkin mengurangi pengali; mesin B seharusnya mengalikan seluruh hasil A.',
       JSON_OBJECT('kind','contextual_compose','a',a,'c',c,'x',xv)
FROM (
  SELECT n,2+MOD(n,3) a,1+MOD(n,3) c,n+2 xv,
         (2+MOD(n,3))*(n+2+1+MOD(n,3)) v
  FROM seed_numbers WHERE n<=4
) p;

-- Rotasi opsi dan feedback mempertahankan hubungan feedback dengan pengecohnya.
INSERT INTO contoh_soal
(kode_contoh,tingkat,urutan,sub_materi,capaian_pembelajaran,tujuan_pembelajaran,
 pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,
 hint_1,hint_2,pembahasan,feedback_salah,metadata_verifikasi,aktif)
SELECT kode,'rendah',seq,sub_materi,
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
FROM seed_low_examples
ON DUPLICATE KEY UPDATE
  urutan=VALUES(urutan),sub_materi=VALUES(sub_materi),capaian_pembelajaran=VALUES(capaian_pembelajaran),
  tujuan_pembelajaran=VALUES(tujuan_pembelajaran),pertanyaan=VALUES(pertanyaan),pilihan_a=VALUES(pilihan_a),
  pilihan_b=VALUES(pilihan_b),pilihan_c=VALUES(pilihan_c),pilihan_d=VALUES(pilihan_d),pilihan_e=VALUES(pilihan_e),
  jawaban_benar=VALUES(jawaban_benar),hint_1=VALUES(hint_1),hint_2=VALUES(hint_2),pembahasan=VALUES(pembahasan),
  feedback_salah=VALUES(feedback_salah),metadata_verifikasi=VALUES(metadata_verifikasi),aktif=1;

DROP TEMPORARY TABLE seed_low_examples;
DROP TEMPORARY TABLE seed_numbers;
COMMIT;
