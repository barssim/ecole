-- Idempotent MySQL migration for secretary-office: rename legacy scope schema to school scope.

SET @legacy_scope := CONCAT('te', 'nant');
SET @legacy_id := CONCAT(@legacy_scope, '_id');
SET @legacy_name := CONCAT(@legacy_scope, '_name');
SET @legacy_email := CONCAT(@legacy_scope, '_email');

SET @legacy_school_table := CONCAT('tb_', @legacy_scope);
SET @legacy_customization_table := CONCAT('tb_', @legacy_scope, '_customization');
SET @school_table := 'tb_school';
SET @school_customization_table := 'tb_school_customization';

SET @rename_table_sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @legacy_school_table
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @school_table
        ),
        CONCAT('RENAME TABLE ', @legacy_school_table, ' TO ', @school_table),
        'SELECT 1'
    )
);
PREPARE stmt FROM @rename_table_sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @rename_table_sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @legacy_customization_table
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @school_customization_table
        ),
        CONCAT('RENAME TABLE ', @legacy_customization_table, ' TO ', @school_customization_table),
        'SELECT 1'
    )
);
PREPARE stmt FROM @rename_table_sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @table_name := 'tb_class';
SET @sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = @legacy_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT('ALTER TABLE ', @table_name, ' CHANGE COLUMN ', @legacy_id, ' school_id VARCHAR(64) NOT NULL'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @table_name := 'tb_attestation';
SET @sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = @legacy_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT('ALTER TABLE ', @table_name, ' CHANGE COLUMN ', @legacy_id, ' school_id VARCHAR(64) NOT NULL'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @table_name := 'tb_activity';
SET @sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = @legacy_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT('ALTER TABLE ', @table_name, ' CHANGE COLUMN ', @legacy_id, ' school_id VARCHAR(64) NOT NULL'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @table_name := 'tb_exam';
SET @sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = @legacy_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT('ALTER TABLE ', @table_name, ' CHANGE COLUMN ', @legacy_id, ' school_id VARCHAR(64) NOT NULL'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @table_name := 'tb_professor_attendance';
SET @sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = @legacy_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT('ALTER TABLE ', @table_name, ' CHANGE COLUMN ', @legacy_id, ' school_id VARCHAR(64) NOT NULL'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @table_name := 'class_schedule_entries';
SET @sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = @legacy_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT('ALTER TABLE ', @table_name, ' CHANGE COLUMN ', @legacy_id, ' school_id VARCHAR(64) NOT NULL'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @table_name := @school_table;
SET @sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = @legacy_name
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = 'school_name'
        ),
        CONCAT('ALTER TABLE ', @table_name, ' CHANGE COLUMN ', @legacy_name, ' school_name VARCHAR(255) NULL'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = @legacy_email
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = 'school_email'
        ),
        CONCAT('ALTER TABLE ', @table_name, ' CHANGE COLUMN ', @legacy_email, ' school_email VARCHAR(255) NULL'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @table_name := @school_customization_table;
SET @sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = @legacy_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT('ALTER TABLE ', @table_name, ' CHANGE COLUMN ', @legacy_id, ' school_id VARCHAR(64) NOT NULL'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = @legacy_name
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = 'school_name'
        ),
        CONCAT('ALTER TABLE ', @table_name, ' CHANGE COLUMN ', @legacy_name, ' school_name VARCHAR(255) NULL'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = @legacy_email
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @table_name
              AND COLUMN_NAME = 'school_email'
        ),
        CONCAT('ALTER TABLE ', @table_name, ' CHANGE COLUMN ', @legacy_email, ' school_email VARCHAR(255) NULL'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
