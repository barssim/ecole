-- Manual MySQL migration for finDB school enforcement.
-- Run once after deploying school-aware code.

-- 1) Backfill legacy rows
UPDATE tb_payments SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';
UPDATE tb_payment_notices SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';
UPDATE tb_factures SET school_id = 'gardinia' WHERE school_id IS NULL OR school_id = '';

-- 2) Enforce NOT NULL
ALTER TABLE tb_payments MODIFY COLUMN school_id VARCHAR(64) NOT NULL;
ALTER TABLE tb_payment_notices MODIFY COLUMN school_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE tb_factures MODIFY COLUMN school_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- 3) Create school indexes if missing
SET @idx_payments_school := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payments'
      AND INDEX_NAME = 'idx_tb_payments_school_id'
);
SET @sql := IF(@idx_payments_school = 0, 'CREATE INDEX idx_tb_payments_school_id ON tb_payments(school_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_notices_school := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payment_notices'
      AND INDEX_NAME = 'idx_tb_payment_notices_school_id'
);
SET @sql := IF(@idx_notices_school = 0, 'CREATE INDEX idx_tb_payment_notices_school_id ON tb_payment_notices(school_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_factures_school := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND INDEX_NAME = 'idx_tb_factures_school_id'
);
SET @sql := IF(@idx_factures_school = 0, 'CREATE INDEX idx_tb_factures_school_id ON tb_factures(school_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) Ensure invoice uniqueness per school (drops global unique if needed)
SET @has_global_invoice_unique := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND INDEX_NAME = 'invoice_number'
      AND NON_UNIQUE = 0
);
SET @sql := IF(@has_global_invoice_unique > 0, 'ALTER TABLE tb_factures DROP INDEX invoice_number', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @uq_school_invoice := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND CONSTRAINT_NAME = 'uk_tb_factures_school_invoice_number'
      AND CONSTRAINT_TYPE = 'UNIQUE'
);
SET @sql := IF(@uq_school_invoice = 0, 'ALTER TABLE tb_factures ADD CONSTRAINT uk_tb_factures_school_invoice_number UNIQUE (school_id, invoice_number)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
