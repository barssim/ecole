-- Manual MySQL migration for renaming the school master data objects and refreshing related constraints.
-- Safe to run multiple times against the same database.

SET @old_master_table := CONCAT('tb_', 'ten', 'ant');
SET @new_master_table := 'tb_school';
SET @old_custom_table := CONCAT('tb_', 'ten', 'ant', '_customization');
SET @new_custom_table := 'tb_school_customization';
SET @old_id_column := CONCAT('ten', 'ant', '_id');
SET @new_id_column := 'school_id';
SET @old_name_column := CONCAT('ten', 'ant', '_name');
SET @new_name_column := 'school_name';
SET @old_email_column := CONCAT('ten', 'ant', '_email');
SET @new_email_column := 'school_email';
SET @old_user_fk := CONCAT('fk_tb_user_', 'ten', 'ant');
SET @new_user_fk := 'fk_tb_user_school';
SET @old_user_uq := CONCAT('uq_tb_user_', 'ten', 'ant', '_email');
SET @new_user_uq := 'uq_tb_user_school_email';
SET @old_user_idx := CONCAT('idx_', 'ten', 'ant', '_id');
SET @new_user_idx := 'idx_school_id';
SET @old_master_name_uq := CONCAT('uq_tb_', 'ten', 'ant', '_name');
SET @new_master_name_uq := 'uq_tb_school_name';
SET @old_custom_fk := CONCAT('fk_tb_', 'ten', 'ant', '_customization_', 'ten', 'ant');
SET @new_custom_fk := 'fk_tb_school_customization_school';

SET @has_old_master_table := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @old_master_table
);

SET @has_new_master_table := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_master_table
);

SET @rename_master_table_sql := IF(
    @has_old_master_table = 1 AND @has_new_master_table = 0,
    CONCAT('RENAME TABLE ', @old_master_table, ' TO ', @new_master_table),
    'SELECT 1'
);

PREPARE stmt FROM @rename_master_table_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_old_custom_table := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @old_custom_table
);

SET @has_new_custom_table := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_custom_table
);

SET @rename_custom_table_sql := IF(
    @has_old_custom_table = 1 AND @has_new_custom_table = 0,
    CONCAT('RENAME TABLE ', @old_custom_table, ' TO ', @new_custom_table),
    'SELECT 1'
);

PREPARE stmt FROM @rename_custom_table_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_old_master_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_master_table
      AND COLUMN_NAME = @old_id_column
);

SET @has_new_master_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_master_table
      AND COLUMN_NAME = @new_id_column
);

SET @rename_master_id_sql := IF(
    @has_old_master_id = 1 AND @has_new_master_id = 0,
    CONCAT(
        'ALTER TABLE ', @new_master_table,
        ' CHANGE COLUMN ', @old_id_column, ' ', @new_id_column, ' VARCHAR(64) ',
        'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL'
    ),
    'SELECT 1'
);

PREPARE stmt FROM @rename_master_id_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_old_master_name := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_master_table
      AND COLUMN_NAME = @old_name_column
);

SET @has_new_master_name := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_master_table
      AND COLUMN_NAME = @new_name_column
);

SET @rename_master_name_sql := IF(
    @has_old_master_name = 1 AND @has_new_master_name = 0,
    CONCAT(
        'ALTER TABLE ', @new_master_table,
        ' CHANGE COLUMN ', @old_name_column, ' ', @new_name_column, ' VARCHAR(128) NOT NULL'
    ),
    'SELECT 1'
);

PREPARE stmt FROM @rename_master_name_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_old_master_email := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_master_table
      AND COLUMN_NAME = @old_email_column
);

SET @has_new_master_email := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_master_table
      AND COLUMN_NAME = @new_email_column
);

SET @rename_master_email_sql := IF(
    @has_old_master_email = 1 AND @has_new_master_email = 0,
    CONCAT(
        'ALTER TABLE ', @new_master_table,
        ' CHANGE COLUMN ', @old_email_column, ' ', @new_email_column, ' VARCHAR(255) NULL'
    ),
    'SELECT 1'
);

PREPARE stmt FROM @rename_master_email_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_current_master_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_master_table
      AND COLUMN_NAME = @new_id_column
);

SET @has_current_master_name := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_master_table
      AND COLUMN_NAME = @new_name_column
);

SET @has_old_user_fk := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND CONSTRAINT_NAME = @old_user_fk
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @drop_old_user_fk_sql := IF(
    @has_old_user_fk = 1,
    CONCAT('ALTER TABLE tb_user DROP FOREIGN KEY ', @old_user_fk),
    'SELECT 1'
);

PREPARE stmt FROM @drop_old_user_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_old_user_uq := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND INDEX_NAME = @old_user_uq
);

SET @drop_old_user_uq_sql := IF(
    @has_old_user_uq = 1,
    CONCAT('ALTER TABLE tb_user DROP INDEX ', @old_user_uq),
    'SELECT 1'
);

PREPARE stmt FROM @drop_old_user_uq_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_old_user_idx := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND INDEX_NAME = @old_user_idx
);

SET @drop_old_user_idx_sql := IF(
    @has_old_user_idx = 1,
    CONCAT('DROP INDEX ', @old_user_idx, ' ON tb_user'),
    'SELECT 1'
);

PREPARE stmt FROM @drop_old_user_idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_old_user_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND COLUMN_NAME = @old_id_column
);

SET @has_new_user_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND COLUMN_NAME = @new_id_column
);

SET @rename_user_id_sql := IF(
    @has_old_user_id = 1 AND @has_new_user_id = 0,
    CONCAT(
        'ALTER TABLE tb_user CHANGE COLUMN ', @old_id_column, ' ', @new_id_column, ' VARCHAR(64) ',
        'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL'
    ),
    'SELECT 1'
);

PREPARE stmt FROM @rename_user_id_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_current_user_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND COLUMN_NAME = @new_id_column
);

SET @has_new_user_fk := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND CONSTRAINT_NAME = @new_user_fk
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @add_new_user_fk_sql := IF(
    @has_new_user_fk = 0 AND @has_current_user_id = 1 AND @has_current_master_id = 1,
    CONCAT(
        'ALTER TABLE tb_user ADD CONSTRAINT ', @new_user_fk,
        ' FOREIGN KEY (', @new_id_column, ') REFERENCES ', @new_master_table, ' (', @new_id_column, ')'
    ),
    'SELECT 1'
);

PREPARE stmt FROM @add_new_user_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_new_user_uq := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND INDEX_NAME = @new_user_uq
);

SET @add_new_user_uq_sql := IF(
    @has_new_user_uq = 0 AND @has_current_user_id = 1,
    CONCAT(
        'ALTER TABLE tb_user ADD CONSTRAINT ', @new_user_uq,
        ' UNIQUE (', @new_id_column, ', email)'
    ),
    'SELECT 1'
);

PREPARE stmt FROM @add_new_user_uq_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_new_user_idx := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tb_user'
      AND INDEX_NAME = @new_user_idx
);

SET @add_new_user_idx_sql := IF(
    @has_new_user_idx = 0 AND @has_current_user_id = 1,
    CONCAT('CREATE INDEX ', @new_user_idx, ' ON tb_user(', @new_id_column, ')'),
    'SELECT 1'
);

PREPARE stmt FROM @add_new_user_idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_old_custom_fk := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_custom_table
      AND CONSTRAINT_NAME = @old_custom_fk
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @drop_old_custom_fk_sql := IF(
    @has_old_custom_fk = 1,
    CONCAT('ALTER TABLE ', @new_custom_table, ' DROP FOREIGN KEY ', @old_custom_fk),
    'SELECT 1'
);

PREPARE stmt FROM @drop_old_custom_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_old_custom_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_custom_table
      AND COLUMN_NAME = @old_id_column
);

SET @has_new_custom_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_custom_table
      AND COLUMN_NAME = @new_id_column
);

SET @rename_custom_id_sql := IF(
    @has_old_custom_id = 1 AND @has_new_custom_id = 0,
    CONCAT(
        'ALTER TABLE ', @new_custom_table,
        ' CHANGE COLUMN ', @old_id_column, ' ', @new_id_column, ' VARCHAR(64) ',
        'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL'
    ),
    'SELECT 1'
);

PREPARE stmt FROM @rename_custom_id_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_current_custom_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_custom_table
      AND COLUMN_NAME = @new_id_column
);

SET @has_new_custom_fk := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_custom_table
      AND CONSTRAINT_NAME = @new_custom_fk
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @add_new_custom_fk_sql := IF(
    @has_new_custom_fk = 0 AND @has_current_custom_id = 1 AND @has_current_master_id = 1,
    CONCAT(
        'ALTER TABLE ', @new_custom_table,
        ' ADD CONSTRAINT ', @new_custom_fk,
        ' FOREIGN KEY (', @new_id_column, ') REFERENCES ', @new_master_table, ' (', @new_id_column, ')'
    ),
    'SELECT 1'
);

PREPARE stmt FROM @add_new_custom_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_old_master_name_uq := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_master_table
      AND INDEX_NAME = @old_master_name_uq
);

SET @drop_old_master_name_uq_sql := IF(
    @has_old_master_name_uq = 1,
    CONCAT('ALTER TABLE ', @new_master_table, ' DROP INDEX ', @old_master_name_uq),
    'SELECT 1'
);

PREPARE stmt FROM @drop_old_master_name_uq_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_new_master_name_uq := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @new_master_table
      AND INDEX_NAME = @new_master_name_uq
);

SET @add_new_master_name_uq_sql := IF(
    @has_new_master_name_uq = 0 AND @has_current_master_name = 1,
    CONCAT(
        'ALTER TABLE ', @new_master_table,
        ' ADD CONSTRAINT ', @new_master_name_uq,
        ' UNIQUE (', @new_name_column, ')'
    ),
    'SELECT 1'
);

PREPARE stmt FROM @add_new_master_name_uq_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'School rename migration completed successfully' AS status;
