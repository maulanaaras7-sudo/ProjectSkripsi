SET NAMES utf8mb4;
USE fungsiverse;

START TRANSACTION;

CREATE TEMPORARY TABLE import_materi (
  judul VARCHAR(150) NOT NULL,
  urutan INT NOT NULL,
  konten TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
) ENGINE=InnoDB;

INSERT INTO import_materi (judul, urutan, konten, created_at) VALUES
('Konsep Dasar Fungsi', 1,
'Fungsi adalah relasi yang memasangkan setiap anggota himpunan A (domain) dengan tepat satu anggota himpunan B (kodomain), dinotasikan f : A → B. Himpunan bagian dari kodomain yang benar-benar dihasilkan oleh proses pemetaan disebut range (daerah hasil). Notasi f(x) = y menyatakan bahwa fungsi f memetakan nilai x pada domain menjadi nilai y pada range.

Berdasarkan sifatnya, fungsi dibedakan menjadi tiga:

1. Fungsi Surjektif (Onto): setiap elemen kodomain B merupakan pasangan dari setidaknya satu elemen domain A, sehingga range = kodomain. Contoh: f(x) = 2x + 1 pada himpunan bilangan rasional, karena untuk setiap y selalu ada x = (y − 1)/2 yang memenuhi f(x) = y.

2. Fungsi Injektif (Satu-satu): setiap dua elemen domain yang berbeda selalu dipetakan ke elemen kodomain yang berbeda pula (f(a₁) = f(a₂) mengakibatkan a₁ = a₂). Secara grafis diuji dengan uji garis horizontal. Contoh: g(x) = x² TIDAK injektif karena g(2) = g(−2) meskipun 2 ≠ −2.

3. Fungsi Bijektif (Korespondensi satu-satu): fungsi yang bersifat injektif sekaligus surjektif. Hanya fungsi bijektif yang dapat memiliki invers berupa fungsi.

Selain sifat-sifatnya, dua fungsi juga dapat dikombinasikan melalui operasi aljabar: (f + g)(x) = f(x) + g(x), (f − g)(x) = f(x) − g(x), (f · g)(x) = f(x) · g(x), dan (f/g)(x) = f(x)/g(x) dengan syarat g(x) ≠ 0. Domain dari hasil operasi tersebut merupakan irisan dari domain fungsi-fungsi yang dioperasikan.',
'2026-08-02 14:02:31'),

('Komposisi Fungsi', 2,
'Komposisi fungsi (f∘g)(x) = f(g(x)) diperoleh dengan menggunakan hasil keluaran fungsi g sebagai masukan bagi fungsi f. Secara umum, jika f : A → B dan g : B → C, maka komposisi fungsi g dan f, dituliskan (g∘f) : A → C, didefinisikan sebagai (g∘f)(x) = g(f(x)). Agar komposisi tersebut terdefinisi, range dari f harus merupakan himpunan bagian dari domain g.

Komposisi fungsi memiliki beberapa sifat penting:
- Pada umumnya tidak komutatif: g∘f ≠ f∘g
- Bersifat asosiatif: h∘(g∘f) = (h∘g)∘f
- Memiliki elemen identitas berupa fungsi I(x) = x

Contoh: jika f(x) = x² + 2 dan g(x) = 3x − 1, maka (g∘f)(x) = 3x² + 5, sedangkan (f∘g)(x) = 9x² − 6x + 3. Kedua hasil tersebut berbeda, yang menunjukkan bahwa urutan pengerjaan komposisi fungsi sangat menentukan hasil akhirnya. Fungsi yang berada di sebelah dalam tanda kurung selalu dikerjakan lebih dahulu.

Hubungan Komposisi dan Invers: apabila f dan g bijektif, maka g∘f juga bijektif dan berlaku (g∘f)⁻¹ = f⁻¹∘g⁻¹ — urutan fungsi terbalik dari komposisi asalnya. Analoginya seperti memakai kaos kaki lalu sepatu: untuk melepasnya, sepatu harus dilepas lebih dahulu sebelum kaos kaki.',
'2026-08-02 14:02:31'),

('Fungsi Invers', 3,
'Invers dari fungsi f, dinotasikan f⁻¹, adalah fungsi yang membalik peran input dan output dari f. Jika f : A → B adalah fungsi bijektif, maka f⁻¹ : B → A didefinisikan sedemikian sehingga f⁻¹(b) = a jika dan hanya jika f(a) = b. Sifat dasarnya: f⁻¹(f(a)) = a untuk setiap a ∈ A, dan f(f⁻¹(b)) = b untuk setiap b ∈ B.

Syarat Penting: suatu fungsi f : A → B memiliki invers HANYA JIKA f bersifat bijektif. Jika f tidak bijektif, f⁻¹ tidak dapat didefinisikan sebagai fungsi, karena ada elemen kodomain yang dipetakan lebih dari satu kali atau tidak memiliki pasangan sama sekali. Untuk fungsi yang tidak bijektif pada domain aslinya, domain dapat dibatasi terlebih dahulu agar fungsi menjadi bijektif.

Catatan Kesalahan Umum: notasi f⁻¹(x) sering keliru ditafsirkan sebagai 1/f(x). Padahal, tanda "−1" pada f⁻¹ menyatakan operasi invers fungsi, bukan pemangkatan.

Langkah Menentukan Rumus Fungsi Invers:
1. Nyatakan y = f(x)
2. Nyatakan kembali x dalam bentuk y
3. Tukar peran x dengan y untuk memperoleh f⁻¹(x)
Domain dari f⁻¹ merupakan range dari f.

Contoh: fungsi f(x) = (2x + 3)/(x − 1), dengan x ≠ 1, memiliki invers f⁻¹(x) = (x + 3)/(x − 2), yang diperoleh melalui prosedur di atas.',
'2026-08-02 14:02:31');

UPDATE materi AS m
JOIN import_materi AS i ON i.judul = m.judul
SET m.urutan = i.urutan,
    m.konten = i.konten,
    m.created_at = i.created_at;

INSERT INTO materi (judul, urutan, konten, created_at)
SELECT i.judul, i.urutan, i.konten, i.created_at
FROM import_materi AS i
WHERE NOT EXISTS (
  SELECT 1 FROM materi AS m WHERE m.judul = i.judul
);

DROP TEMPORARY TABLE import_materi;

COMMIT;
