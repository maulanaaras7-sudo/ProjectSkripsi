-- Durasi pretest dan posttest yang dapat diubah oleh guru.
-- Percobaan yang sudah berjalan tetap memakai deadline_pada yang telah dibuat.
CREATE TABLE IF NOT EXISTS evaluation_settings (
  jenis VARCHAR(10) PRIMARY KEY CHECK (jenis IN ('pretest','posttest')),
  durasi_menit INTEGER NOT NULL CHECK (durasi_menit BETWEEN 5 AND 180),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  diperbarui_oleh INTEGER REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO evaluation_settings (jenis,durasi_menit) VALUES
  ('pretest',60),
  ('posttest',60)
ON CONFLICT (jenis) DO NOTHING;
