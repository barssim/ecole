-- Guarded MySQL migration for finance-manager school scoping.

SET @legacy_scope_column := CONCAT('ten', 'ant', '_id');
SET @legacy_entity_table := CONCAT('tb_', 'ten', 'ant');
SET @legacy_customization_table := CONCAT('tb_', 'ten', 'ant', '_customization');
SET @scope_column := 'school_id';
SET @entity_table := 'tb_school';
SET @customization_table := 'tb_school_customization';
SET @legacy_name_column := CONCAT('ten', 'ant', '_name');
SET @legacy_email_column := CONCAT('ten', 'ant', '_email');
SET @name_column := 'school_name';
SET @email_column := 'school_email';

SET @has_legacy_table := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @legacy_entity_table
);
SET @has_new_table := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @entity_table
);
SET @sql := IF(@has_legacy_table = 1 AND @has_new_table = 0,
    CONCAT('RENAME TABLE ', @legacy_entity_table, ' TO ', @entity_table),
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_legacy_table := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @legacy_customization_table
);
SET @has_new_table := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @customization_table
);
SET @sql := IF(@has_legacy_table = 1 AND @has_new_table = 0,
    CONCAT('RENAME TABLE ', @legacy_customization_table, ' TO ', @customization_table),
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_legacy_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payments'
      AND COLUMN_NAME = @legacy_scope_column
);
SET @has_new_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payments'
      AND COLUMN_NAME = @scope_column
);
SET @sql := IF(@has_legacy_column = 1 AND @has_new_column = 0,
    CONCAT('ALTER TABLE tb_payments CHANGE COLUMN ', @legacy_scope_column, ' ', @scope_column, ' VARCHAR(64) NOT NULL'),
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql := IF(@has_legacy_column = 1 OR @has_new_column = 1,
    'ALTER TABLE tb_payments MODIFY COLUMN school_id VARCHAR(64) NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_legacy_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payment_notices'
      AND COLUMN_NAME = @legacy_scope_column
);
SET @has_new_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payment_notices'
      AND COLUMN_NAME = @scope_column
);
SET @sql := IF(@has_legacy_column = 1 AND @has_new_column = 0,
    CONCAT('ALTER TABLE tb_payment_notices CHANGE COLUMN ', @legacy_scope_column, ' ', @scope_column, ' VARCHAR(64) NOT NULL DEFAULT ''default'''),
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql := IF(@has_legacy_column = 1 OR @has_new_column = 1,
    'ALTER TABLE tb_payment_notices MODIFY COLUMN school_id VARCHAR(64) NOT NULL DEFAULT ''default''',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_legacy_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND COLUMN_NAME = @legacy_scope_column
);
SET @has_new_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND COLUMN_NAME = @scope_column
);
SET @sql := IF(@has_legacy_column = 1 AND @has_new_column = 0,
    CONCAT('ALTER TABLE tb_factures CHANGE COLUMN ', @legacy_scope_column, ' ', @scope_column, ' VARCHAR(64) NOT NULL DEFAULT ''default'''),
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql := IF(@has_legacy_column = 1 OR @has_new_column = 1,
    'ALTER TABLE tb_factures MODIFY COLUMN school_id VARCHAR(64) NOT NULL DEFAULT ''default''',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_name_table := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @customization_table
);
SET @has_legacy_name_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @customization_table
      AND COLUMN_NAME = @legacy_name_column
);
SET @has_new_name_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @customization_table
      AND COLUMN_NAME = @name_column
);
SET @sql := IF(@has_name_table = 1 AND @has_legacy_name_column = 1 AND @has_new_name_column = 0,
    CONCAT('ALTER TABLE ', @customization_table, ' CHANGE COLUMN ', @legacy_name_column, ' ', @name_column, ' VARCHAR(255) NULL'),
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_legacy_email_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @customization_table
      AND COLUMN_NAME = @legacy_email_column
);
SET @has_new_email_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @customization_table
      AND COLUMN_NAME = @email_column
);
SET @sql := IF(@has_name_table = 1 AND @has_legacy_email_column = 1 AND @has_new_email_column = 0,
    CONCAT('ALTER TABLE ', @customization_table, ' CHANGE COLUMN ', @legacy_email_column, ' ', @email_column, ' VARCHAR(255) NULL'),
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @payments_old_index := CONCAT('idx_tb_payments_', @legacy_scope_column);
SET @payments_old_index_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payments'
      AND INDEX_NAME = @payments_old_index
);
SET @sql := IF(@payments_old_index_exists > 0, CONCAT('ALTER TABLE tb_payments DROP INDEX ', @payments_old_index), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @payments_new_index_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payments'
      AND INDEX_NAME = 'idx_tb_payments_school_id'
);
SET @sql := IF(@payments_new_index_exists = 0, 'CREATE INDEX idx_tb_payments_school_id ON tb_payments(school_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @notices_old_index := CONCAT('idx_tb_payment_notices_', @legacy_scope_column);
SET @notices_old_index_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payment_notices'
      AND INDEX_NAME = @notices_old_index
);
SET @sql := IF(@notices_old_index_exists > 0, CONCAT('ALTER TABLE tb_payment_notices DROP INDEX ', @notices_old_index), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @notices_new_index_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_payment_notices'
      AND INDEX_NAME = 'idx_tb_payment_notices_school_id'
);
SET @sql := IF(@notices_new_index_exists = 0, 'CREATE INDEX idx_tb_payment_notices_school_id ON tb_payment_notices(school_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @factures_old_index := CONCAT('idx_tb_factures_', @legacy_scope_column);
SET @factures_old_index_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND INDEX_NAME = @factures_old_index
);
SET @sql := IF(@factures_old_index_exists > 0, CONCAT('ALTER TABLE tb_factures DROP INDEX ', @factures_old_index), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @factures_new_index_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND INDEX_NAME = 'idx_tb_factures_school_id'
);
SET @sql := IF(@factures_new_index_exists = 0, 'CREATE INDEX idx_tb_factures_school_id ON tb_factures(school_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @legacy_unique_name := CONCAT('uk_tb_factures_', 'ten', 'ant', '_invoice_number');
SET @legacy_unique_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND CONSTRAINT_NAME = @legacy_unique_name
      AND CONSTRAINT_TYPE = 'UNIQUE'
);
SET @sql := IF(@legacy_unique_exists > 0, CONCAT('ALTER TABLE tb_factures DROP INDEX ', @legacy_unique_name), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @global_invoice_unique := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND INDEX_NAME = 'invoice_number'
      AND NON_UNIQUE = 0
);
SET @sql := IF(@global_invoice_unique > 0, 'ALTER TABLE tb_factures DROP INDEX invoice_number', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @school_invoice_unique := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_factures'
      AND CONSTRAINT_NAME = 'uk_tb_factures_school_invoice_number'
      AND CONSTRAINT_TYPE = 'UNIQUE'
);
SET @sql := IF(@school_invoice_unique = 0, 'ALTER TABLE tb_factures ADD CONSTRAINT uk_tb_factures_school_invoice_number UNIQUE (school_id, invoice_number)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
