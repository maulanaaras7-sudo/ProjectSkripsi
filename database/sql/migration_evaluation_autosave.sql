-- Draft jawaban pre-test/post-test untuk autosave lintas refresh dan login.
CREATE TABLE IF NOT EXISTS draft_jawaban_evaluasi (
  user_id INT NOT NULL,
  attempt_key VARCHAR(191) NOT NULL,
  jenis ENUM('pretest','posttest') NOT NULL,
  soal_id INT NOT NULL,
  jawaban_dipilih ENUM('a','b','c','d','e') NOT NULL,
  diperbarui_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, attempt_key, soal_id),
  KEY idx_draft_evaluasi_user_jenis (user_id, jenis),
  CONSTRAINT fk_draft_evaluasi_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_draft_evaluasi_soal FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
) ENGINE=InnoDB;
