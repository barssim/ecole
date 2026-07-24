-- Manual MySQL migration for finDB tenant enforcement.
-- Run once after deploying tenant-aware code.

-- 1) Backfill legacy rows
UPDATE tb_payments SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_payment_notices SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE tb_factures SET tenant_id = 'gardinia' WHERE tenant_id IS NULL OR tenant_id = '';

-- 2) Enforce NOT NULL
ALTER TABLE tb_payments MODIFY COLUMN tenant_id VARCHAR(64) NOT NULL;
ALTER TABLE tb_payment_notices MODIFY COLUMN tenant_id VARCHAR(64) NOT NULL;
ALTER TABLE tb_factures MODIFY COLUMN tenant_id VARCHAR(64) NOT NULL;

-- 3) Create tenant indexes if missing
SET @idx_payments_tenant := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payments'
      AND INDEX_NAME = 'idx_tb_payments_tenant_id'
);
SET @sql := IF(@idx_payments_tenant = 0, 'CREATE INDEX idx_tb_payments_tenant_id ON tb_payments(tenant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_notices_tenant := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payment_notices'
      AND INDEX_NAME = 'idx_tb_payment_notices_tenant_id'
);
SET @sql := IF(@idx_notices_tenant = 0, 'CREATE INDEX idx_tb_payment_notices_tenant_id ON tb_payment_notices(tenant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_factures_tenant := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND INDEX_NAME = 'idx_tb_factures_tenant_id'
);
SET @sql := IF(@idx_factures_tenant = 0, 'CREATE INDEX idx_tb_factures_tenant_id ON tb_factures(tenant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) Ensure invoice uniqueness per tenant (drops global unique if needed)
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

SET @uq_tenant_invoice := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND CONSTRAINT_NAME = 'uk_tb_factures_tenant_invoice_number'
      AND CONSTRAINT_TYPE = 'UNIQUE'
);
SET @sql := IF(@uq_tenant_invoice = 0, 'ALTER TABLE tb_factures ADD CONSTRAINT uk_tb_factures_tenant_invoice_number UNIQUE (tenant_id, invoice_number)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

