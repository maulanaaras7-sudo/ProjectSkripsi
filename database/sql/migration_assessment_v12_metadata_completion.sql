SET NAMES utf8mb4;

ALTER TABLE assessment_items
  ADD COLUMN ipk_dominant_target ENUM('C2','C3','C4') NULL AFTER ipk_description,
  ADD COLUMN fixed_quota_eligible TINYINT(1) NOT NULL DEFAULT 0 AFTER blueprint_status;

