-- Manual MySQL migration for secretaryOfficeDB SCHOOL enforcement.
-- Run once after deploying SCHOOL-aware code.

-- 1) Backfill legacy rows
UPDATE tb_class SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';
UPDATE tb_attestation SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';
UPDATE tb_activity SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';
UPDATE tb_exam SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';
UPDATE tb_professor_attendance SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';

-- 2) Enforce NOT NULL
ALTER TABLE tb_class MODIFY COLUMN school_id VARCHAR(64) NOT NULL;
ALTER TABLE tb_attestation MODIFY COLUMN school_id VARCHAR(64) NOT NULL;
ALTER TABLE tb_activity MODIFY COLUMN school_id VARCHAR(64) NOT NULL;
ALTER TABLE tb_exam MODIFY COLUMN school_id VARCHAR(64) NOT NULL;
ALTER TABLE tb_professor_attendance MODIFY COLUMN school_id VARCHAR(64) NOT NULL;

-- 3) Create SCHOOL indexes if missing
SET @idx_class_SCHOOL := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_class'
      AND INDEX_NAME = 'idx_tb_class_school_id'
);
SET @sql := IF(@idx_class_SCHOOL = 0, 'CREATE INDEX idx_tb_class_school_id ON tb_class(school_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_attestation_SCHOOL := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_attestation'
      AND INDEX_NAME = 'idx_tb_attestation_school_id'
);
SET @sql := IF(@idx_attestation_SCHOOL = 0, 'CREATE INDEX idx_tb_attestation_school_id ON tb_attestation(school_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_activity_SCHOOL := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_activity'
      AND INDEX_NAME = 'idx_tb_activity_school_id'
);
SET @sql := IF(@idx_activity_SCHOOL = 0, 'CREATE INDEX idx_tb_activity_school_id ON tb_activity(school_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exam_SCHOOL := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_exam'
      AND INDEX_NAME = 'idx_tb_exam_school_id'
);
SET @sql := IF(@idx_exam_SCHOOL = 0, 'CREATE INDEX idx_tb_exam_school_id ON tb_exam(school_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_presence_SCHOOL := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_professor_attendance'
      AND INDEX_NAME = 'idx_tb_professor_attendance_school_id'
);
SET @sql := IF(@idx_presence_SCHOOL = 0, 'CREATE INDEX idx_tb_professor_attendance_school_id ON tb_professor_attendance(school_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) Ensure unique constraints required by code
SET @uq_class_SCHOOL_name := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_class'
      AND CONSTRAINT_NAME = 'uk_class_school_name'
      AND CONSTRAINT_TYPE = 'UNIQUE'
);
SET @sql := IF(@uq_class_SCHOOL_name = 0, 'ALTER TABLE tb_class ADD CONSTRAINT uk_class_school_name UNIQUE (school_id, name)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @uq_attestation_SCHOOL_reference := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_attestation'
      AND CONSTRAINT_NAME = 'uk_attestation_school_reference'
      AND CONSTRAINT_TYPE = 'UNIQUE'
);
SET @sql := IF(@uq_attestation_SCHOOL_reference = 0, 'ALTER TABLE tb_attestation ADD CONSTRAINT uk_attestation_school_reference UNIQUE (school_id, reference)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


