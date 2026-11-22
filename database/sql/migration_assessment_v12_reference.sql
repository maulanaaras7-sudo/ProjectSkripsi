SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS assessment_blueprint_reference (
  bank_version_id BIGINT UNSIGNED NOT NULL,
  reference_kind ENUM('cp','tp','ipk','subtopics','selection_constraints') NOT NULL,
  payload JSON NOT NULL,
  PRIMARY KEY (bank_version_id, reference_kind),
  CONSTRAINT fk_blueprint_reference_version FOREIGN KEY (bank_version_id) REFERENCES assessment_bank_versions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
