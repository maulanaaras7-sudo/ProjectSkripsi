-- Generated from the currently served PHP reference material. Do not edit manually.
BEGIN;
INSERT INTO materi(id,judul,urutan,konten) VALUES (1,'Konsep Dasar Fungsi',1,'### Pengertian fungsi, domain, kodomain, dan range

Fungsi adalah aturan yang memasangkan setiap anggota himpunan asal dengan tepat satu anggota himpunan tujuan. Jika fungsi \(f\) memetakan \(A\) ke \(B\), tuliskan \(f:A\rightarrow B\).

Domain adalah semua masukan yang diperbolehkan, kodomain adalah himpunan tujuan yang ditetapkan, dan range adalah keluaran yang benar-benar dihasilkan. Range merupakan bagian dari kodomain, tetapi tidak selalu sama dengannya.

Contoh 1. Untuk \(A=\{-2,0,3\}\), \(B=\{1,2,5,10\}\), dan \(f(x)=x^2+1\), diperoleh \(f(-2)=5\), \(f(0)=1\), dan \(f(3)=10\). Jadi domainnya \(A\), kodomainnya \(B\), dan rangenya \(\{1,5,10\}\). Angka \(2\) ada di kodomain, tetapi bukan range.

### Injektif, surjektif, dan bijektif

- Injektif: masukan berbeda mempunyai keluaran berbeda; \(f(a_1)=f(a_2)\) mengakibatkan \(a_1=a_2\).

- Surjektif: setiap anggota kodomain mempunyai pasangan; range sama dengan kodomain.

- Bijektif: sekaligus injektif dan surjektif. Invers \(f:A\to B\) ada sebagai fungsi \(B\to A\) jika \(f\) bijektif.

Contoh 2. \(f(x)=2x+1\) dari \(\mathbb R\) ke \(\mathbb R\) adalah bijektif. Sebaliknya, \(g(x)=x^2\) dari \(\mathbb R\) ke \(\mathbb R\) bukan injektif dan tidak menghasilkan bilangan negatif.

### Operasi aljabar pada fungsi

\[
(f+g)(x)=f(x)+g(x)
\]

\[
(f-g)(x)=f(x)-g(x)
\]

\[
(f\cdot g)(x)=f(x)g(x)
\]

\[
\left(\frac{f}{g}\right)(x)=\frac{f(x)}{g(x)},\qquad g(x)\ne0
\]

Domain penjumlahan, pengurangan, dan perkalian adalah irisan domain kedua fungsi. Pada pembagian, keluarkan nilai yang membuat penyebut nol. Contoh 3: jika \(f(x)=x+4\) dan \(g(x)=2x-3\), maka \((f+g)(x)=3x+1\), \((f\cdot g)(x)=2x^2+5x-12\), serta \(\left(\frac f g\right)(x)=\frac{x+4}{2x-3}\) dengan \(x\ne\frac32\).

Rangkuman: setiap masukan fungsi memiliki satu keluaran; domain, kodomain, dan range berbeda; operasi pembagian memerlukan penyebut tak nol.') ON CONFLICT (id) DO UPDATE SET judul=EXCLUDED.judul,urutan=EXCLUDED.urutan,konten=EXCLUDED.konten;
INSERT INTO materi(id,judul,urutan,konten) VALUES (2,'Komposisi Fungsi',2,'### Konsep dan notasi komposisi

Komposisi menerapkan satu fungsi setelah fungsi lain. \((f\circ g)(x)=f(g(x))\) berarti kerjakan \(g\) lebih dahulu, kemudian \(f\). Jika \(f:A\to B\) dan \(g:B\to C\), maka \(g\circ f:A\to C\). Untuk domain terbatas, \(x\) harus berada pada domain \(f\) dan \(f(x)\) harus berada pada domain \(g\).

### Komposisi dua atau lebih fungsi

Contoh 4. Jika \(f(x)=x^2+2\) dan \(g(x)=3x-1\), maka \((g\circ f)(x)=3x^2+5\), sedangkan \((f\circ g)(x)=9x^2-6x+3\). Jadi pada umumnya \(f\circ g\ne g\circ f\).

Untuk tiga fungsi berlaku sifat asosiatif \(h\circ(g\circ f)=(h\circ g)\circ f\); pengelompokan berubah, urutan penerapan tidak. Contoh 5: \(f(x)=x+7\), \(g(x)=2x-4\), dan \(h(x)=x^2\) memberikan \((h\circ g\circ f)(x)=(2x+10)^2\). Fungsi identitas \(I(x)=x\) memenuhi \(f\circ I=I\circ f=f\) pada domain sesuai.

### Hubungan komposisi dengan invers

Jika fungsi-fungsinya bijektif dan kompatibel, urutan dibalik: \((g\circ f)^{-1}=f^{-1}\circ g^{-1}\). Contoh 6: \(f(x)=5x+2\), \(g(x)=x-6\). Karena \((g\circ f)(x)=5x-4\), inversnya \(\frac{x+4}{5}\). Ini sama dengan \((f^{-1}\circ g^{-1})(x)\), bukan urutan invers yang ditukar sembarangan.

### Model kontekstual

Contoh 7. Diskon 15% lalu ongkos kirim Rp12.500 dapat dimodelkan dengan \(f(x)=0{,}85x\) dan \(g(s)=s+12.500\). Harga akhir \((g\circ f)(x)=0{,}85x+12.500\). Untuk harga awal Rp160.000, hasilnya Rp148.500. Ongkir sebelum diskon menghasilkan model lain, sehingga urutan proses penting.

Rangkuman: komposisi umumnya tidak komutatif, tetapi asosiatif; model harus mengikuti urutan kejadian sebenarnya.') ON CONFLICT (id) DO UPDATE SET judul=EXCLUDED.judul,urutan=EXCLUDED.urutan,konten=EXCLUDED.konten;
INSERT INTO materi(id,judul,urutan,konten) VALUES (3,'Fungsi Invers',3,'### Pengertian dan syarat invers

Invers membalik pemetaan: bila \(f(a)=b\), maka \(f^{-1}(b)=a\). Notasi \(f^{-1}(x)\) bukan \(1/f(x)\). Agar \(f:A\to B\) mempunyai invers sebagai fungsi, pemetaannya harus bijektif. Untuk fungsi bijektif, \(f^{-1}(f(x))=x\) dan \(f(f^{-1}(y))=y\) pada himpunan yang sesuai.

### Menentukan invers secara aljabar

- Nyatakan \(y=f(x)\), selesaikan untuk \(x\) dalam bentuk \(y\), lalu tukar simbol \(x\) dan \(y\).

- Periksa domain, range, dan komposisi baliknya.

Contoh 8. Dari \(y=3x-5\), diperoleh \(x=\frac{y+5}{3}\), sehingga \(f^{-1}(x)=\frac{x+5}{3}\).

### Kuadrat, grafik, dan domain

Contoh 9. \(x^2\) pada seluruh real tidak injektif. Dengan \(f:[0,\infty)\to[0,\infty)\), inversnya \(f^{-1}(x)=\sqrt{x}\). Jika domainnya \(( -\infty,0]\), inversnya \(-\sqrt{x}\); dua cabang tidak digabung sebagai satu keluaran invers.

Grafik \(f^{-1}\) adalah pencerminan grafik \(f\) terhadap \(y=x\). Titik \((a,b)\) menjadi \((b,a)\); domain dan range saling bertukar. Contoh 10: \(f(x)=5x-7\) memiliki invers \(\frac{x+7}{5}\), sehingga titik \((2,3)\) berpasangan dengan \((3,2)\). Gunakan Simulasi GeoGebra untuk menampilkan \(f\), \(f^{-1}\), dan \(y=x\).

### Invers rasional dan konteks

Contoh 11. Untuk \(f(x)=\frac{2x+3}{x-1}\), \(x\ne1\), dengan kodomain \(\mathbb R\setminus\{2\}\), inversnya \(f^{-1}(x)=\frac{x+3}{x-2}\), \(x\ne2\).

Contoh 12. Biaya sewa \(C(t)=18.000+9.000t\) untuk \(t\ge0\) memiliki invers \(C^{-1}(y)=\frac{y-18.000}{9.000}\), \(y\ge18.000\). Pembayaran Rp81.000 berarti 7 jam.

Rangkuman: invers memerlukan bijektivitas; grafiknya merupakan refleksi terhadap \(y=x\); dan invers komposisi membalik urutan proses.') ON CONFLICT (id) DO UPDATE SET judul=EXCLUDED.judul,urutan=EXCLUDED.urutan,konten=EXCLUDED.konten;
SELECT setval(pg_get_serial_sequence('materi','id'),COALESCE((SELECT MAX(id) FROM materi),1),true);
COMMIT;
