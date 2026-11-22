SET NAMES utf8mb4;

ALTER TABLE assessment_items
  MODIFY COLUMN ipk_dominant_target ENUM('C2','C3','C4') NOT NULL;

