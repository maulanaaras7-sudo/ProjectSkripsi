# Fungsiverse Next.js + Neon

Versi Next.js dari Fungsiverse yang disiapkan untuk Vercel dengan PostgreSQL Neon. Project PHP asli tidak diubah dan alur aplikasinya dipertahankan.

## Fitur yang dimigrasikan

- Autentikasi siswa dan guru dengan cookie JWT `httpOnly` serta password bcrypt.
- Registrasi, dashboard siswa/guru, materi, dan visualisasi GeoGebra.
- Pre-test/post-test 25 soal dengan komposisi dan cakupan submateri yang sama.
- Klasifikasi kemampuan awal dan latihan adaptif bertingkat.
- Aktivitas materi terbimbing dan progres siswa.
- CRUD materi/soal dan laporan hasil siswa untuk guru.
- Proteksi soal yang sudah pernah digunakan.
- Bank soal aktif: 450 latihan, 100 pre-test, dan 100 post-test.

## Persyaratan

- Node.js 22 atau lebih baru.
- Database PostgreSQL Neon.

## Menyiapkan database Neon

1. Buat project di Neon, lalu buka **Connect**.
2. Pilih **Pooled connection** dan salin connection string-nya.
3. Buka **SQL Editor** Neon dan jalankan file berikut secara berurutan:

   1. `database/neon/01_schema.sql`
   2. `database/neon/02_seed_questions.sql`
   3. `database/neon/03_seed_activities.sql`
   4. `database/neon/04_finalize.sql`

Folder `database/sql` adalah arsip skema MySQL sumber dan tidak perlu dijalankan pada Neon.

## Menjalankan secara lokal

Salin `.env.example` menjadi `.env.local`, lalu isi:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/neondb?sslmode=require
AUTH_SECRET=secret-acak-minimal-32-karakter
```

Jalankan:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Deploy ke Vercel

1. Push folder ini ke repository Git.
2. Import repository tersebut di Vercel. Jika berada dalam monorepo, pilih folder ini sebagai **Root Directory**.
3. Tambahkan `DATABASE_URL` dan `AUTH_SECRET` ke **Settings > Environment Variables** untuk Production, Preview, dan Development.
4. Gunakan pooled connection string Neon pada `DATABASE_URL`.
5. Deploy. Vercel akan mengenali Next.js secara otomatis.

Neon juga dapat dibuat melalui Vercel Marketplace. Pastikan variable hasil integrasinya tersedia sebagai `DATABASE_URL`; adapter juga menerima `POSTGRES_URL` sebagai fallback.

## Verifikasi

```bash
npm run typecheck
npm run build
```

Seed pertanyaan dapat dibangun ulang dari bank soal MySQL sumber dengan `npm run db:build-seed`.
