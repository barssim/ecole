-- Manual MySQL migration for secretaryOfficeDB tenant enforcement.
-- Run once after deploying tenant-aware code.

-- 1) Backfill legacy rows
UPDATE tb_class SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_attestation SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_activity SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_exam SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_professor_attendance SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';

-- 2) Enforce NOT NULL
ALTER TABLE tb_class MODIFY COLUMN tenant_id VARCHAR(64) NOT NULL;
ALTER TABLE tb_attestation MODIFY COLUMN tenant_id VARCHAR(64) NOT NULL;
ALTER TABLE tb_activity MODIFY COLUMN tenant_id VARCHAR(64) NOT NULL;
ALTER TABLE tb_exam MODIFY COLUMN tenant_id VARCHAR(64) NOT NULL;
ALTER TABLE tb_professor_attendance MODIFY COLUMN tenant_id VARCHAR(64) NOT NULL;

-- 3) Create tenant indexes if missing
SET @idx_class_tenant := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_class'
      AND INDEX_NAME = 'idx_tb_class_tenant_id'
);
SET @sql := IF(@idx_class_tenant = 0, 'CREATE INDEX idx_tb_class_tenant_id ON tb_class(tenant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_attestation_tenant := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_attestation'
      AND INDEX_NAME = 'idx_tb_attestation_tenant_id'
);
SET @sql := IF(@idx_attestation_tenant = 0, 'CREATE INDEX idx_tb_attestation_tenant_id ON tb_attestation(tenant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_activity_tenant := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_activity'
      AND INDEX_NAME = 'idx_tb_activity_tenant_id'
);
SET @sql := IF(@idx_activity_tenant = 0, 'CREATE INDEX idx_tb_activity_tenant_id ON tb_activity(tenant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exam_tenant := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_exam'
      AND INDEX_NAME = 'idx_tb_exam_tenant_id'
);
SET @sql := IF(@idx_exam_tenant = 0, 'CREATE INDEX idx_tb_exam_tenant_id ON tb_exam(tenant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_presence_tenant := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_professor_attendance'
      AND INDEX_NAME = 'idx_tb_professor_attendance_tenant_id'
);
SET @sql := IF(@idx_presence_tenant = 0, 'CREATE INDEX idx_tb_professor_attendance_tenant_id ON tb_professor_attendance(tenant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) Ensure unique constraints required by code
SET @uq_class_tenant_name := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_class'
      AND CONSTRAINT_NAME = 'uk_class_tenant_name'
      AND CONSTRAINT_TYPE = 'UNIQUE'
);
SET @sql := IF(@uq_class_tenant_name = 0, 'ALTER TABLE tb_class ADD CONSTRAINT uk_class_tenant_name UNIQUE (tenant_id, name)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @uq_attestation_tenant_reference := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_attestation'
      AND CONSTRAINT_NAME = 'uk_attestation_tenant_reference'
      AND CONSTRAINT_TYPE = 'UNIQUE'
);
SET @sql := IF(@uq_attestation_tenant_reference = 0, 'ALTER TABLE tb_attestation ADD CONSTRAINT uk_attestation_tenant_reference UNIQUE (tenant_id, reference)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

