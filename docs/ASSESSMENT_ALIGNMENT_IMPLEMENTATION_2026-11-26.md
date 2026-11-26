# Laporan audit dan penyelarasan pretest–posttest

Tanggal: 26 November 2026

## Hasil audit

- Database aktif memuat 100 PRE dan 100 POST. Setiap bank berisi 34 rendah, 33 sedang, dan 33 tinggi.
- Seluruh 200 butir memiliki ID unik, submateri, TP, IPK, level kognitif, lima opsi, pembahasan, dan kunci yang konsisten dengan `metadata_verifikasi.expected`.
- Tidak ditemukan duplikasi batang soal di dalam bank yang sama.
- Matriks stok per SM belum mengikuti target inventaris blueprint. Stok tetap cukup untuk seluruh 25 slot paket, sehingga tidak ada shortage runtime.
- Empat belas butir berada pada sel kuota paket nol: `PRE-F-013`–`PRE-F-016`, `POST-F-013`–`POST-F-016` (SM09 rendah), serta `PRE-F-092`–`PRE-F-094`, `POST-F-092`–`POST-F-094` (SM03 tinggi). Butir tidak diubah dan tidak dipilih oleh paket.
- Delapan belas butir SM02 masih berkode TP01, sedangkan kisi-kisi menyebut SM02 sebagai prasyarat TP02–TP03. Keputusan metadata memerlukan persetujuan akademik.
- Sepuluh butir berlabel kesulitan tinggi tetapi level kognitif C2: `PRE-F-084`, `PRE-F-088`, `PRE-F-092`–`PRE-F-094`, serta pasangan POST-nya. Kesulitan dan level kognitif tidak disamakan atau diubah otomatis.
- Sebanyak 96 pasangan PRE–POST identik setelah frasa “Evaluasi awal/akhir” dinormalisasi. Empat pasangan (`072`–`075`) hanya berbeda pada konstanta fungsi. Independensi kedua bank memerlukan review ahli walaupun identitas dan tabel bank terpisah.
- Seluruh 200 batang soal menampilkan label tingkat kesulitan. Hal ini dapat memberi petunjuk kepada peserta dan perlu keputusan validator instrumen.
- Tabel runtime `soal` belum mempunyai metadata eksplisit `indicator`, `status`, dan `version`; keterlacakan saat ini memakai `kode_ipk`, `aktif`, serta `metadata_verifikasi`.

Inventaris per item dan matriks lengkap tersedia pada:

- `docs/ASSESSMENT_BANK_AUDIT_2026-11-26.md`
- `docs/assessment-bank-audit-inventory-2026-11-26.json`

## Implementasi teknis

- Blueprint sembilan submateri menjadi sumber slot paket yang tervalidasi.
- Pemilih paket mengambil tepat satu butir untuk setiap slot yang dialokasikan, tanpa fallback ke submateri atau tingkat lain.
- Pemilihan tetap deterministik berdasarkan identitas siswa, jenis tes, slot, dan ID butir.
- Bank PRE dan POST difilter terpisah. Posttest tidak memakai kategori kemampuan siswa.
- Pengacakan opsi mempertahankan nilai ID opsi `a`–`e`; pemeriksaan benar tetap membandingkan ID tersebut dengan `jawaban_benar`.
- API mengembalikan HTTP 503 dan daftar slot yang kosong jika blueprint tidak dapat dipenuhi, serta menulis log `assessment-blueprint-shortage`.
- Tidak ada schema, identitas butir, kunci, jawaban siswa, nilai, atau mekanisme latihan adaptif yang diubah.

## Normalisasi istilah sumbu

- Sebelum perubahan ditemukan 76 frasa: 32 pada PRE/POST dan 44 pada latihan, semuanya berada di kolom pilihan jawaban.
- Seluruh frasa telah diubah dari bentuk bertanda hubung menjadi “sumbu x” atau “sumbu y” pada seed dan database aktif.
- Pencarian ulang pada sumber pengguna dan dry-run database menghasilkan nol temuan.
- Snapshot rollback berada di `docs/axis-term-backup-2026-11-26.json`.
- Rollback terkontrol: `node --env-file=.env.local scripts/normalize-axis-terms.mjs --rollback=docs/axis-term-backup-2026-11-26.json`.

## Verifikasi

- `npm.cmd run typecheck`: lulus.
- `npm.cmd run test:assessment`: 5/5 lulus.
- `npm.cmd run test:simulation-lab`: 20 kasus matematika dan pemeriksaan perintah slider lulus; parser fungsi juga lulus.
- Pemilih baru diuji terhadap bank Neon aktual untuk 50 identitas × 2 jenis tes: 100/100 paket valid, stabil, unik, sembilan submateri, dan 8/9/8.
- `npm.cmd run build`: lulus, 26 halaman berhasil dibuat.
- Verifikasi akhir database: tetap 100 PRE + 100 POST, distribusi 34/33/33 per bank, dan nol mismatch kunci–expected.
- Tampilan evaluasi terautentikasi pada browser desktop/mobile belum diuji karena pengujian ini tidak membuat atau memakai akun siswa baru.

