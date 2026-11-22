-- Modul contoh tingkat menengah: 50 soal bertahap dengan dua hint,
-- pembahasan, dan feedback yang mengikuti setiap pengecoh.
SET NAMES utf8mb4;
USE fungsiverse;
START TRANSACTION;

UPDATE contoh_soal SET aktif=0
WHERE tingkat='sedang' AND kode_contoh NOT REGEXP '^CON-M-[0-9]{3}$';

DROP TEMPORARY TABLE IF EXISTS seed_numbers;
CREATE TEMPORARY TABLE seed_numbers (n INT PRIMARY KEY);
INSERT INTO seed_numbers (n) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20);

DROP TEMPORARY TABLE IF EXISTS seed_medium_examples;
CREATE TEMPORARY TABLE seed_medium_examples (
 seq INT PRIMARY KEY, kode VARCHAR(50), sub_materi VARCHAR(120), tujuan TEXT, pertanyaan TEXT,
 benar VARCHAR(255), salah_1 VARCHAR(255), salah_2 VARCHAR(255), salah_3 VARCHAR(255), salah_4 VARCHAR(255),
 hint_1 TEXT, hint_2 TEXT, pembahasan TEXT,
 umpan_1 TEXT, umpan_2 TEXT, umpan_3 TEXT, umpan_4 TEXT, metadata JSON
);

-- 1-4: notasi komposisi.
INSERT INTO seed_medium_examples
SELECT n,CONCAT('CON-M-',LPAD(n,3,'0')),'notasi_komposisi',
 'Menafsirkan urutan substitusi pada komposisi fungsi.',
 CONCAT('Untuk f(x)=x^2+',n,' dan g(x)=',n+1,'x-1, bentuk (g o f)(x) sebelum disederhanakan adalah ...'),
 'g(f(x))','f(g(x))','g(x)+f(x)','g(x)f(x)','f(x)-g(x)',
 'Baca notasi komposisi dari kanan ke kiri.','Tentukan fungsi yang langsung menerima x.',
 '(g o f)(x)=g(f(x)); f menerima x lebih dahulu, lalu keluarannya menjadi masukan g.',
 'Urutan ini menghasilkan (f o g)(x), bukan (g o f)(x).','Komposisi bukan penjumlahan fungsi.',
 'Komposisi dilakukan dengan substitusi, bukan perkalian.','Pengurangan fungsi tidak mewakili komposisi.',
 JSON_OBJECT('kind','literal','expected','g(f(x))')
FROM seed_numbers WHERE n<=4;

-- 5-12: komposisi linear-kuadrat.
INSERT INTO seed_medium_examples
SELECT 4+n,CONCAT('CON-M-',LPAD(4+n,3,'0')),'nilai_dan_rumus_komposisi',
 'Menghitung komposisi linear-kuadrat melalui substitusi dua tahap.',
 CONCAT('Jika f(x)=x^2+',b,' dan g(x)=x+',c,', tentukan (f o g)(',xv,').'),
 CAST(v AS CHAR),CAST(v+1 AS CHAR),CAST(v-1 AS CHAR),CAST(v+2 AS CHAR),CAST(v-2 AS CHAR),
 CONCAT('Hitung g(',xv,') terlebih dahulu.'),CONCAT('Setelah mendapat ',xv+c,', kuadratkan nilai tersebut lalu tambah ',b,'.'),
 CONCAT('g(',xv,')=',xv+c,'. Jadi f(',xv+c,')=(',xv+c,')^2+',b,'=',v,'.'),
 'Ada kelebihan satu; periksa penjumlahan setelah mengkuadratkan.','Ada kekurangan satu; konstanta f harus ditambahkan.',
 'Ada kelebihan dua; jangan menambahkan konstanta dua kali.','Ada kekurangan dua; hitung kuadrat sebelum menjumlahkan konstanta.',
 JSON_OBJECT('kind','compose_quadratic_value','b',b,'c',c,'x',xv)
FROM (
 SELECT n,1+MOD(n,5) b,1+MOD(n,3) c,n xv,POW(n+1+MOD(n,3),2)+1+MOD(n,5) v
 FROM seed_numbers WHERE n<=8
) p;

-- 13-17: menentukan fungsi dalam.
INSERT INTO seed_medium_examples
SELECT 12+n,CONCAT('CON-M-',LPAD(12+n,3,'0')),'menentukan_fungsi_penyusun',
 'Menentukan fungsi dalam linear dari fungsi luar dan hasil komposisi.',
 CONCAT('Diketahui f(x)=',a,'x+',b,' dan (f o g)(x)=',pcoef,'x+',q,'. Tentukan g(x).'),
 CONCAT(dcoef,'x+',c),CONCAT(dcoef,'x+',c+1),CONCAT(dcoef+1,'x+',c),
 CONCAT(dcoef,'x+',c+2),CONCAT(dcoef+2,'x+',c),
 'Misalkan g(x)=dx+c.','Samakan koefisien x dan konstanta pada f(g(x)) dengan komposisi yang diketahui.',
 CONCAT('f(g(x))=',a,'(dx+c)+',b,'=',a,'dx+',a,'c+',b,'. Maka d=',dcoef,' dan c=',c,'.'),
 'Konstanta terlalu besar satu; selesaikan ac+b=q.','Koefisien terlalu besar satu; gunakan ad sebagai koefisien komposisi.',
 'Konstanta terlalu besar dua; jangan abaikan konstanta b dari f.','Koefisien terlalu besar dua; bagi koefisien komposisi dengan koefisien f.',
 JSON_OBJECT('kind','recover_inner_linear','a',a,'b',b,'p',pcoef,'q',q)
FROM (
 SELECT n,2+MOD(n,3) a,1+MOD(n,4) b,2+MOD(n,3) dcoef,1+MOD(n,5) c,
        (2+MOD(n,3))*(2+MOD(n,3)) pcoef,
        (2+MOD(n,3))*(1+MOD(n,5))+(1+MOD(n,4)) q
 FROM seed_numbers WHERE n<=5
) p;

-- 18-22: sifat komposisi.
INSERT INTO seed_medium_examples
SELECT 17+n,CONCAT('CON-M-',LPAD(17+n,3,'0')),'sifat_komposisi',
 'Menggunakan sifat asosiatif komposisi tanpa menukar urutan fungsi.',
 CONCAT('Bentuk yang setara dengan (f o g) o h pada contoh ',n,' adalah ...'),
 'f o (g o h)','g o (f o h)','h o (g o f)','f o (h o g)','g o (h o f)',
 'Sifat asosiatif mengubah pengelompokan, bukan urutan.','Pertahankan urutan f, g, h dari kiri ke kanan.',
 '(f o g) o h=f o (g o h). Tanda kurung boleh berpindah karena komposisi bersifat asosiatif.',
 'Pilihan ini menukar f dan g.','Urutan seluruh fungsi dibalik.','Pilihan ini menukar g dan h.','Pilihan ini mengubah urutan menjadi g, h, f.',
 JSON_OBJECT('kind','literal','expected','f o (g o h)')
FROM seed_numbers WHERE n<=5;

-- 23-27: invers kuadrat dan pembatasan domain.
INSERT INTO seed_medium_examples
SELECT 22+n,CONCAT('CON-M-',LPAD(22+n,3,'0')),'konsep_dan_syarat_invers',
 'Menentukan pembatasan domain fungsi kuadrat agar satu-satu.',
 CONCAT('Agar f(x)=(x-',h,')^2+',k,' mempunyai invers, salah satu pembatasan domain yang tepat adalah ...'),
 CONCAT('x>=',h),'semua bilangan real',CONCAT('x!=',h),CONCAT('x<',h,' atau x>',h),CONCAT('x=',h),
 CONCAT('Titik puncak parabola berada pada x=',h,'.'),'Pilih hanya satu cabang parabola agar setiap output berasal dari satu input.',
 CONCAT('Pada x>=',h,' fungsi mengikuti satu cabang dan bersifat satu-satu, sehingga mempunyai invers.'),
 'Pada seluruh real, dua titik yang simetris terhadap puncak memberi nilai sama.','Menghapus titik puncak masih menyisakan dua cabang.',
 'Gabungan dua sisi puncak tetap tidak satu-satu.','Domain satu titik terlalu sempit dan bukan pembatasan cabang yang dimaksud.',
 JSON_OBJECT('kind','literal','expected',CONCAT('x>=',h))
FROM (SELECT n,MOD(n,4) h,1+MOD(n,5) k FROM seed_numbers WHERE n<=5) p;

-- 28-31: rumus invers linear.
INSERT INTO seed_medium_examples
SELECT 27+n,CONCAT('CON-M-',LPAD(27+n,3,'0')),'rumus_dan_nilai_invers',
 'Menentukan rumus invers linear secara aljabar.',
 CONCAT('Tentukan invers dari f(x)=',a,'x+',b,'.'),
 CONCAT('(x-',b,')/',a),CONCAT('(x+',b,')/',a),CONCAT(a,'x-',b),CONCAT('(x-',b,')*',a),CONCAT('1/(',a,'x+',b,')'),
 'Ganti f(x) dengan y, lalu tukar peran input dan output.','Pindahkan konstanta lebih dahulu, kemudian bagi dengan koefisien x.',
 CONCAT('y=',a,'x+',b,' memberi x=(y-',b,')/',a,'. Jadi f^-1(x)=(x-',b,')/',a,'.'),
 'Tanda konstanta salah saat dipindahkan.','Koefisien belum digunakan untuk membagi.','Operasi terakhir harus membagi, bukan mengalikan.',
 'Invers fungsi bukan kebalikan nilai 1/f(x).',
 JSON_OBJECT('kind','inverse_linear_formula','a',a,'b',b)
FROM (SELECT n,2+MOD(n,3) a,n+2 b FROM seed_numbers WHERE n<=4) p;

-- 32-35: nilai invers kuadrat berdomain terbatas.
INSERT INTO seed_medium_examples
SELECT 31+n,CONCAT('CON-M-',LPAD(31+n,3,'0')),'rumus_dan_nilai_invers',
 'Menghitung nilai invers kuadrat dengan memilih akar sesuai domain.',
 CONCAT('Untuk f(x)=(x-',h,')^2+',k,' dengan x>=',h,', tentukan f^-1(',outputv,').'),
 CAST(ans AS CHAR),CAST(ans+1 AS CHAR),CAST(ans-1 AS CHAR),CAST(ans+2 AS CHAR),CAST(ans-2 AS CHAR),
 CONCAT('Kurangi keluaran dengan ',k,' lalu ambil akar kuadrat positif.'),CONCAT('Tambahkan kembali pergeseran horizontal ',h,'.'),
 CONCAT('x=',h,'+sqrt(',outputv,'-',k,')=',h,'+',rootv,'=',ans,'. Akar positif dipilih karena domain x>=',h,'.'),
 'Hasil satu terlalu besar; jangan menambahkan pergeseran dua kali.','Hasil satu terlalu kecil; pergeseran horizontal tetap harus ditambahkan.',
 'Hasil dua terlalu besar; periksa akar kuadratnya.','Hasil dua terlalu kecil; gunakan cabang positif sesuai domain.',
 JSON_OBJECT('kind','inverse_quadratic_value','h',h,'k',k,'output',outputv)
FROM (
 SELECT n,MOD(n,3) h,1+MOD(n,4) k,2+n rootv,MOD(n,3)+2+n ans,POW(2+n,2)+1+MOD(n,4) outputv
 FROM seed_numbers WHERE n<=4
) p;

-- 36-40: invers komposisi.
INSERT INTO seed_medium_examples
SELECT 35+n,CONCAT('CON-M-',LPAD(35+n,3,'0')),'invers_komposisi',
 'Membalik urutan tiga fungsi pada invers komposisi.',
 CONCAT('Jika f, g, h bijektif, maka (f o g o h)^-1 pada contoh ',n,' adalah ...'),
 'h^-1 o g^-1 o f^-1','f^-1 o g^-1 o h^-1','h^-1 o f^-1 o g^-1','f o g o h','h o g o f',
 'Bayangkan membatalkan langkah terakhir terlebih dahulu.','Balik setiap fungsi dan balik pula urutannya.',
 '(f o g o h)^-1=h^-1 o g^-1 o f^-1 karena h dikerjakan pertama dan dibatalkan terakhir.',
 'Fungsinya diinvers, tetapi urutannya belum dibalik.','Posisi f dan g masih keliru.','Ini komposisi awal, bukan invers.','Urutan dibalik tetapi setiap fungsi belum diinvers.',
 JSON_OBJECT('kind','literal','expected','h^-1 o g^-1 o f^-1')
FROM seed_numbers WHERE n<=5;

-- 41-44: grafik fungsi dan invers.
INSERT INTO seed_medium_examples
SELECT 40+n,CONCAT('CON-M-',LPAD(40+n,3,'0')),'grafik_fungsi_dan_invers',
 'Menghubungkan titik grafik fungsi dengan titik grafik invers.',
 CONCAT('Grafik f melalui (',p,',',q,'). Koordinat titik terkait pada grafik f^-1 adalah ...'),
 CONCAT('(',q,',',p,')'),CONCAT('(',p,',',q,')'),CONCAT('(',-q,',',-p,')'),CONCAT('(',q,',',-p,')'),CONCAT('(',-q,',',p,')'),
 'Gunakan simetri terhadap garis y=x.','Pencerminan terhadap y=x menukar posisi koordinat.',
 CONCAT('Koordinat ditukar tanpa mengubah tanda: (',p,',',q,') menjadi (',q,',',p,').'),
 'Koordinat belum ditukar.','Ini pencerminan terhadap titik asal.','Tanda koordinat kedua tidak perlu berubah.','Tanda koordinat pertama tidak perlu berubah.',
 JSON_OBJECT('kind','point_swap','p',p,'q',q)
FROM (SELECT n,n+1 p,3*n+2 q FROM seed_numbers WHERE n<=4) p;

-- 45-50: konteks tiga operasi.
INSERT INTO seed_medium_examples
SELECT 44+n,CONCAT('CON-M-',LPAD(44+n,3,'0')),'kontekstual',
 'Memodelkan masalah tiga operasi sebagai komposisi fungsi.',
 CONCAT('Diberikan p(x)=x+',c,' dan q(x)=',a,'x+',b,
        '. Untuk x=',xv,', nilai (q o p)(x) adalah ...'),
 CAST(v AS CHAR),CAST(v+1 AS CHAR),CAST(v-1 AS CHAR),CAST(v+a AS CHAR),CAST(v-a AS CHAR),
 'Kerjakan fungsi p terlebih dahulu, kemudian masukkan hasilnya ke q.','Gunakan bentuk q(p(x))=a(x+c)+b.',
 CONCAT('Hitung ',xv,'+',c,'=',xv+c,', lalu ',a,'(',xv+c,')+',b,'=',v,'.'),
 'Kelebihan satu biasanya berasal dari konstanta akhir.','Kekurangan satu; pastikan konstanta akhir ditambahkan.',
 'Pengali ditambahkan sekali lagi; seharusnya hanya mengalikan hasil tahap pertama.','Pengali dikurangi; ikuti operasi pada cerita secara berurutan.',
 JSON_OBJECT('kind','contextual_affine','a',a,'b',b,'c',c,'x',xv)
FROM (
 SELECT n,2+MOD(n,3) a,1+MOD(n,4) b,2+MOD(n,3) c,n+5 xv,
        (2+MOD(n,3))*(n+5+2+MOD(n,3))+(1+MOD(n,4)) v
 FROM seed_numbers WHERE n<=6
) p;

INSERT INTO contoh_soal
(kode_contoh,tingkat,urutan,sub_materi,capaian_pembelajaran,tujuan_pembelajaran,
 pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,
 hint_1,hint_2,pembahasan,feedback_salah,metadata_verifikasi,aktif)
SELECT kode,'sedang',seq,sub_materi,
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
FROM seed_medium_examples
ON DUPLICATE KEY UPDATE
 urutan=VALUES(urutan),sub_materi=VALUES(sub_materi),capaian_pembelajaran=VALUES(capaian_pembelajaran),
 tujuan_pembelajaran=VALUES(tujuan_pembelajaran),pertanyaan=VALUES(pertanyaan),pilihan_a=VALUES(pilihan_a),
 pilihan_b=VALUES(pilihan_b),pilihan_c=VALUES(pilihan_c),pilihan_d=VALUES(pilihan_d),pilihan_e=VALUES(pilihan_e),
 jawaban_benar=VALUES(jawaban_benar),hint_1=VALUES(hint_1),hint_2=VALUES(hint_2),pembahasan=VALUES(pembahasan),
 feedback_salah=VALUES(feedback_salah),metadata_verifikasi=VALUES(metadata_verifikasi),aktif=1;

DROP TEMPORARY TABLE seed_medium_examples;
DROP TEMPORARY TABLE seed_numbers;
COMMIT;
