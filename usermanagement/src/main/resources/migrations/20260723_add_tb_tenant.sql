-- Manual MySQL migration for tenant master table and FK enforcement.
-- Run once against the userDB database.

CREATE TABLE IF NOT EXISTS tb_tenant (
    tenant_id VARCHAR(64) PRIMARY KEY,
    tenant_name VARCHAR(128) NOT NULL,
    CONSTRAINT uq_tb_tenant_name UNIQUE (tenant_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO tb_tenant (tenant_id, tenant_name) VALUES
('gardinia', 'Gardinia'),
('qods', 'Qods');

ALTER TABLE tb_user
    ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NULL;

-- Backfill old rows first so NOT NULL + FK can be applied safely.
UPDATE tb_user
SET tenant_id = 'gardinia'
WHERE tenant_id IS NULL OR tenant_id = '';

-- Optional demo split used by current seed users.
UPDATE tb_user SET tenant_id = 'qods' WHERE surname IN ('manager', 'teacher', 'finance');
UPDATE tb_user SET tenant_id = 'gardinia' WHERE surname IN ('admin', 'parent', 'student');

ALTER TABLE tb_user
    MODIFY COLUMN tenant_id VARCHAR(64) NOT NULL;

SET @fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND CONSTRAINT_NAME = 'fk_tb_user_tenant'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @fk_sql := IF(
    @fk_exists = 0,
    'ALTER TABLE tb_user ADD CONSTRAINT fk_tb_user_tenant FOREIGN KEY (tenant_id) REFERENCES tb_tenant (tenant_id)',
    'SELECT 1'
);
PREPARE stmt FROM @fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @uq_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND CONSTRAINT_NAME = 'uq_tb_user_tenant_email'
      AND CONSTRAINT_TYPE = 'UNIQUE'
);
SET @uq_sql := IF(
    @uq_exists = 0,
    'ALTER TABLE tb_user ADD CONSTRAINT uq_tb_user_tenant_email UNIQUE (tenant_id, email)',
    'SELECT 1'
);
PREPARE stmt FROM @uq_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND INDEX_NAME = 'idx_tenant_id'
);
SET @idx_sql := IF(
    @idx_exists = 0,
    'CREATE INDEX idx_tenant_id ON tb_user(tenant_id)',
    'SELECT 1'
);
PREPARE stmt FROM @idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


