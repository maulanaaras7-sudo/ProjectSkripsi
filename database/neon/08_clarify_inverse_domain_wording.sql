-- Mempertegas bahwa cabang kanan parabola dipilih agar jawaban domain tunggal.
-- Identitas butir, pilihan jawaban, dan kunci jawaban tidak diubah.
WITH target AS (
  SELECT
    s.id,
    s.jenis,
    s.tingkat_kesulitan,
    parsed.parts[1]::integer AS h,
    parsed.parts[2]::integer AS k
  FROM soal AS s
  CROSS JOIN LATERAL regexp_match(
    s.pertanyaan,
    'f\(x\)=\(x-(-?[0-9]+)\)\^2\+(-?[0-9]+)'
  ) AS parsed(parts)
  WHERE s.metadata_verifikasi->>'template' = 'inverse_domain_analysis'
),
wording AS (
  SELECT
    id,
    h,
    k,
    CASE jenis
      WHEN 'pretest' THEN 'Evaluasi awal'
      WHEN 'posttest' THEN 'Evaluasi akhir'
      ELSE 'Latihan'
    END || ' tingkat ' || tingkat_kesulitan || '. ' AS prefix,
    CASE
      WHEN h = 0 THEN format('f(x)=x^2+%s', k)
      ELSE format('f(x)=(x-%s)^2+%s', h, k)
    END AS function_text,
    CASE
      WHEN h = 0 THEN format('f^-1(x)=√(x-%s)', k)
      ELSE format('f^-1(x)=%s+√(x-%s)', h, k)
    END AS inverse_text
  FROM target
)
UPDATE soal AS s
SET
  pertanyaan = wording.prefix
    || 'Fungsi ' || wording.function_text
    || ' memiliki domain ℝ dan kodomain [' || wording.k || ',∞). '
    || 'Agar f memiliki fungsi invers dengan memilih bagian grafik yang monoton naik, '
    || 'domain f harus dibatasi menjadi ...',
  pembahasan = 'Pada interval [' || wording.h || ',∞), fungsi '
    || wording.function_text
    || ' monoton naik dan memetakan domain tersebut tepat ke kodomain ['
    || wording.k || ',∞). Karena itu, f bersifat bijektif dan mempunyai invers '
    || wording.inverse_text || '.'
FROM wording
WHERE s.id = wording.id;
