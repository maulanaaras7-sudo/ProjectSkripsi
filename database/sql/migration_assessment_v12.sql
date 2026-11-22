-- Fungsiverse Stage 08: versioned assessment storage and immutable attempt snapshots.
-- Apply only to an isolated staging database before expert validation/final sign-off.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS assessment_bank_versions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  version VARCHAR(32) NOT NULL,
  bank_sha256 CHAR(64) NOT NULL,
  blueprint_sha256 CHAR(64) NOT NULL,
  selection_sha256 CHAR(64) NOT NULL,
  selection_mode ENUM('A','B') NOT NULL,
  lifecycle_status ENUM('staging_candidate','validated','research_active','retired') NOT NULL DEFAULT 'staging_candidate',
  item_count INT UNSIGNED NOT NULL,
  imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_assessment_version (version),
  UNIQUE KEY uq_assessment_bank_hash (bank_sha256)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assessment_items (
  bank_version_id BIGINT UNSIGNED NOT NULL,
  soal_id INT NOT NULL,
  academic_id VARCHAR(32) NOT NULL,
  paired_item_id VARCHAR(32) NOT NULL,
  test_type ENUM('pretest','posttest') NOT NULL,
  cp_code VARCHAR(16) NOT NULL,
  subtopic_code VARCHAR(16) NOT NULL,
  subtopic VARCHAR(160) NOT NULL,
  tp_code VARCHAR(16) NOT NULL,
  tp_description TEXT NOT NULL,
  ipk_code VARCHAR(16) NOT NULL,
  ipk_description TEXT NOT NULL,
  ipk_dominant_target ENUM('C2','C3','C4') NOT NULL,
  item_indicator TEXT NOT NULL,
  cognitive_level ENUM('C2','C3','C4') NOT NULL,
  difficulty ENUM('Rendah','Sedang','Tinggi') NOT NULL,
  difficulty_basis VARCHAR(120) NOT NULL,
  option_metadata JSON NOT NULL,
  correct_option_id VARCHAR(48) NOT NULL,
  answer_key CHAR(1) NOT NULL,
  math_format VARCHAR(64) NOT NULL,
  solution_method VARCHAR(255) NOT NULL,
  solution_status VARCHAR(120) NOT NULL,
  review_notes TEXT NOT NULL,
  blueprint_status VARCHAR(80) NOT NULL,
  fixed_quota_eligible TINYINT(1) NOT NULL DEFAULT 0,
  proposed_template_eligible TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (bank_version_id, academic_id),
  UNIQUE KEY uq_assessment_item_soal_version (bank_version_id, soal_id),
  KEY idx_assessment_item_profile (bank_version_id, test_type, subtopic_code, difficulty, tp_code, ipk_code, cognitive_level),
  CONSTRAINT fk_assessment_item_version FOREIGN KEY (bank_version_id) REFERENCES assessment_bank_versions(id) ON DELETE RESTRICT,
  CONSTRAINT fk_assessment_item_soal FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assessment_blueprint_reference (
  bank_version_id BIGINT UNSIGNED NOT NULL,
  reference_kind ENUM('cp','tp','ipk','subtopics','selection_constraints') NOT NULL,
  payload JSON NOT NULL,
  PRIMARY KEY (bank_version_id, reference_kind),
  CONSTRAINT fk_blueprint_reference_version FOREIGN KEY (bank_version_id) REFERENCES assessment_bank_versions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assessment_selection_groups (
  bank_version_id BIGINT UNSIGNED NOT NULL,
  group_id VARCHAR(16) NOT NULL,
  subtopic_code VARCHAR(16) NOT NULL,
  difficulty ENUM('Rendah','Sedang','Tinggi') NOT NULL,
  tp_code VARCHAR(16) NOT NULL,
  ipk_code VARCHAR(16) NOT NULL,
  cognitive_level ENUM('C2','C3','C4') NOT NULL,
  PRIMARY KEY (bank_version_id, group_id),
  CONSTRAINT fk_assessment_group_version FOREIGN KEY (bank_version_id) REFERENCES assessment_bank_versions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assessment_selection_group_items (
  bank_version_id BIGINT UNSIGNED NOT NULL,
  group_id VARCHAR(16) NOT NULL,
  test_type ENUM('pretest','posttest') NOT NULL,
  academic_id VARCHAR(32) NOT NULL,
  soal_id INT NOT NULL,
  paired_item_id VARCHAR(32) NOT NULL,
  PRIMARY KEY (bank_version_id, group_id, test_type, academic_id),
  UNIQUE KEY uq_group_item_once (bank_version_id, test_type, academic_id),
  CONSTRAINT fk_group_item_group FOREIGN KEY (bank_version_id, group_id) REFERENCES assessment_selection_groups(bank_version_id, group_id) ON DELETE RESTRICT,
  CONSTRAINT fk_group_item_assessment FOREIGN KEY (bank_version_id, academic_id) REFERENCES assessment_items(bank_version_id, academic_id) ON DELETE RESTRICT,
  CONSTRAINT fk_group_item_soal FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assessment_selection_templates (
  bank_version_id BIGINT UNSIGNED NOT NULL,
  template_id VARCHAR(16) NOT NULL,
  PRIMARY KEY (bank_version_id, template_id),
  CONSTRAINT fk_assessment_template_version FOREIGN KEY (bank_version_id) REFERENCES assessment_bank_versions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assessment_selection_template_groups (
  bank_version_id BIGINT UNSIGNED NOT NULL,
  template_id VARCHAR(16) NOT NULL,
  group_id VARCHAR(16) NOT NULL,
  required_count INT UNSIGNED NOT NULL,
  PRIMARY KEY (bank_version_id, template_id, group_id),
  CONSTRAINT fk_template_group_template FOREIGN KEY (bank_version_id, template_id) REFERENCES assessment_selection_templates(bank_version_id, template_id) ON DELETE RESTRICT,
  CONSTRAINT fk_template_group_group FOREIGN KEY (bank_version_id, group_id) REFERENCES assessment_selection_groups(bank_version_id, group_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS evaluation_participant_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bank_version_id BIGINT UNSIGNED NOT NULL,
  research_id_hash CHAR(64) NOT NULL,
  template_id VARCHAR(16) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_participant_bank (user_id, bank_version_id),
  CONSTRAINT fk_participant_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_participant_version FOREIGN KEY (bank_version_id) REFERENCES assessment_bank_versions(id) ON DELETE RESTRICT,
  CONSTRAINT fk_participant_template FOREIGN KEY (bank_version_id, template_id) REFERENCES assessment_selection_templates(bank_version_id, template_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS evaluation_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  attempt_key VARCHAR(191) NOT NULL,
  participant_profile_id BIGINT UNSIGNED NOT NULL,
  user_id INT NOT NULL,
  bank_version_id BIGINT UNSIGNED NOT NULL,
  test_type ENUM('pretest','posttest') NOT NULL,
  template_id VARCHAR(16) NOT NULL,
  status ENUM('active','submitted','expired','cancelled') NOT NULL DEFAULT 'active',
  deadline_at DATETIME NULL,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_evaluation_attempt_key (attempt_key),
  UNIQUE KEY uq_evaluation_attempt_user_type_version (user_id, test_type, bank_version_id),
  CONSTRAINT fk_attempt_profile FOREIGN KEY (participant_profile_id) REFERENCES evaluation_participant_profiles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_attempt_version FOREIGN KEY (bank_version_id) REFERENCES assessment_bank_versions(id) ON DELETE RESTRICT,
  CONSTRAINT fk_attempt_template FOREIGN KEY (bank_version_id, template_id) REFERENCES assessment_selection_templates(bank_version_id, template_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS evaluation_attempt_items (
  attempt_id BIGINT UNSIGNED NOT NULL,
  soal_id INT NOT NULL,
  academic_id VARCHAR(32) NOT NULL,
  paired_item_id VARCHAR(32) NOT NULL,
  question_order INT UNSIGNED NOT NULL,
  option_order JSON NOT NULL,
  snapshot_stem TEXT NOT NULL,
  snapshot_options JSON NOT NULL,
  correct_option_id VARCHAR(48) NOT NULL,
  selected_option_id VARCHAR(48) NULL,
  is_correct TINYINT(1) NULL,
  PRIMARY KEY (attempt_id, academic_id),
  UNIQUE KEY uq_attempt_question_order (attempt_id, question_order),
  UNIQUE KEY uq_attempt_soal (attempt_id, soal_id),
  CONSTRAINT fk_attempt_item_attempt FOREIGN KEY (attempt_id) REFERENCES evaluation_attempts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_attempt_item_soal FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

ALTER TABLE jawaban_siswa
  ADD COLUMN evaluation_attempt_id BIGINT UNSIGNED NULL AFTER soal_id,
  ADD COLUMN academic_item_id VARCHAR(32) NULL AFTER evaluation_attempt_id,
  ADD COLUMN bank_version VARCHAR(32) NULL AFTER academic_item_id,
  ADD COLUMN selected_option_id VARCHAR(48) NULL AFTER jawaban_dipilih,
  ADD KEY idx_jawaban_attempt (evaluation_attempt_id),
  ADD CONSTRAINT fk_jawaban_attempt FOREIGN KEY (evaluation_attempt_id) REFERENCES evaluation_attempts(id) ON DELETE RESTRICT;

