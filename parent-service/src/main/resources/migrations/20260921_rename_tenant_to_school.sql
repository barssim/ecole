SET @old_scope_table = CONCAT('tb_', 'ten', 'ant');
SET @new_scope_table = 'tb_school';
SET @old_customization_table = CONCAT('tb_', 'ten', 'ant', '_customization');
SET @new_customization_table = 'tb_school_customization';
SET @old_scope_id = CONCAT('ten', 'ant', '_id');
SET @old_scope_name = CONCAT('ten', 'ant', '_name');
SET @old_scope_email = CONCAT('ten', 'ant', '_email');
SET @new_scope_id = 'school_id';
SET @new_scope_name = 'school_name';
SET @new_scope_email = 'school_email';

SET @rename_scope_table_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @old_scope_table
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
        ),
        CONCAT('RENAME TABLE `', @old_scope_table, '` TO `', @new_scope_table, '`'),
        'SELECT 1'
    )
);
PREPARE rename_scope_table_stmt FROM @rename_scope_table_sql;
EXECUTE rename_scope_table_stmt;
DEALLOCATE PREPARE rename_scope_table_stmt;

SET @rename_customization_table_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @old_customization_table
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
        ),
        CONCAT('RENAME TABLE `', @old_customization_table, '` TO `', @new_customization_table, '`'),
        'SELECT 1'
    )
);
PREPARE rename_customization_table_stmt FROM @rename_customization_table_sql;
EXECUTE rename_customization_table_stmt;
DEALLOCATE PREPARE rename_customization_table_stmt;

SET @rename_school_id_parent_registrations_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'parent_registrations'
              AND COLUMN_NAME = @old_scope_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'parent_registrations'
              AND COLUMN_NAME = @new_scope_id
        ),
        CONCAT(
            'ALTER TABLE `parent_registrations` CHANGE COLUMN `',
            @old_scope_id,
            '` `',
            @new_scope_id,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE rename_school_id_parent_registrations_stmt FROM @rename_school_id_parent_registrations_sql;
EXECUTE rename_school_id_parent_registrations_stmt;
DEALLOCATE PREPARE rename_school_id_parent_registrations_stmt;

SET @rename_school_id_parent_attestation_requests_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'parent_attestation_requests'
              AND COLUMN_NAME = @old_scope_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'parent_attestation_requests'
              AND COLUMN_NAME = @new_scope_id
        ),
        CONCAT(
            'ALTER TABLE `parent_attestation_requests` CHANGE COLUMN `',
            @old_scope_id,
            '` `',
            @new_scope_id,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE rename_school_id_parent_attestation_requests_stmt FROM @rename_school_id_parent_attestation_requests_sql;
EXECUTE rename_school_id_parent_attestation_requests_stmt;
DEALLOCATE PREPARE rename_school_id_parent_attestation_requests_stmt;

SET @rename_school_id_parent_attendance_records_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'parent_attendance_records'
              AND COLUMN_NAME = @old_scope_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'parent_attendance_records'
              AND COLUMN_NAME = @new_scope_id
        ),
        CONCAT(
            'ALTER TABLE `parent_attendance_records` CHANGE COLUMN `',
            @old_scope_id,
            '` `',
            @new_scope_id,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE rename_school_id_parent_attendance_records_stmt FROM @rename_school_id_parent_attendance_records_sql;
EXECUTE rename_school_id_parent_attendance_records_stmt;
DEALLOCATE PREPARE rename_school_id_parent_attendance_records_stmt;

SET @rename_school_id_parent_progress_records_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'parent_progress_records'
              AND COLUMN_NAME = @old_scope_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'parent_progress_records'
              AND COLUMN_NAME = @new_scope_id
        ),
        CONCAT(
            'ALTER TABLE `parent_progress_records` CHANGE COLUMN `',
            @old_scope_id,
            '` `',
            @new_scope_id,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE rename_school_id_parent_progress_records_stmt FROM @rename_school_id_parent_progress_records_sql;
EXECUTE rename_school_id_parent_progress_records_stmt;
DEALLOCATE PREPARE rename_school_id_parent_progress_records_stmt;

SET @rename_school_id_parent_payments_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'parent_payments'
              AND COLUMN_NAME = @old_scope_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'parent_payments'
              AND COLUMN_NAME = @new_scope_id
        ),
        CONCAT(
            'ALTER TABLE `parent_payments` CHANGE COLUMN `',
            @old_scope_id,
            '` `',
            @new_scope_id,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE rename_school_id_parent_payments_stmt FROM @rename_school_id_parent_payments_sql;
EXECUTE rename_school_id_parent_payments_stmt;
DEALLOCATE PREPARE rename_school_id_parent_payments_stmt;

SET @rename_school_id_tb_school_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
              AND COLUMN_NAME = @old_scope_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
              AND COLUMN_NAME = @new_scope_id
        ),
        CONCAT(
            'ALTER TABLE `',
            @new_scope_table,
            '` CHANGE COLUMN `',
            @old_scope_id,
            '` `',
            @new_scope_id,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE rename_school_id_tb_school_stmt FROM @rename_school_id_tb_school_sql;
EXECUTE rename_school_id_tb_school_stmt;
DEALLOCATE PREPARE rename_school_id_tb_school_stmt;

SET @rename_school_name_tb_school_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
              AND COLUMN_NAME = @old_scope_name
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
              AND COLUMN_NAME = @new_scope_name
        ),
        CONCAT(
            'ALTER TABLE `',
            @new_scope_table,
            '` CHANGE COLUMN `',
            @old_scope_name,
            '` `',
            @new_scope_name,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE rename_school_name_tb_school_stmt FROM @rename_school_name_tb_school_sql;
EXECUTE rename_school_name_tb_school_stmt;
DEALLOCATE PREPARE rename_school_name_tb_school_stmt;

SET @rename_school_email_tb_school_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
              AND COLUMN_NAME = @old_scope_email
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
              AND COLUMN_NAME = @new_scope_email
        ),
        CONCAT(
            'ALTER TABLE `',
            @new_scope_table,
            '` CHANGE COLUMN `',
            @old_scope_email,
            '` `',
            @new_scope_email,
            '` VARCHAR(255) NULL'
        ),
        'SELECT 1'
    )
);
PREPARE rename_school_email_tb_school_stmt FROM @rename_school_email_tb_school_sql;
EXECUTE rename_school_email_tb_school_stmt;
DEALLOCATE PREPARE rename_school_email_tb_school_stmt;

SET @rename_school_id_tb_school_customization_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
              AND COLUMN_NAME = @old_scope_id
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
              AND COLUMN_NAME = @new_scope_id
        ),
        CONCAT(
            'ALTER TABLE `',
            @new_customization_table,
            '` CHANGE COLUMN `',
            @old_scope_id,
            '` `',
            @new_scope_id,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE rename_school_id_tb_school_customization_stmt FROM @rename_school_id_tb_school_customization_sql;
EXECUTE rename_school_id_tb_school_customization_stmt;
DEALLOCATE PREPARE rename_school_id_tb_school_customization_stmt;

SET @rename_school_name_tb_school_customization_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
              AND COLUMN_NAME = @old_scope_name
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
              AND COLUMN_NAME = @new_scope_name
        ),
        CONCAT(
            'ALTER TABLE `',
            @new_customization_table,
            '` CHANGE COLUMN `',
            @old_scope_name,
            '` `',
            @new_scope_name,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE rename_school_name_tb_school_customization_stmt FROM @rename_school_name_tb_school_customization_sql;
EXECUTE rename_school_name_tb_school_customization_stmt;
DEALLOCATE PREPARE rename_school_name_tb_school_customization_stmt;

SET @rename_school_email_tb_school_customization_sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
              AND COLUMN_NAME = @old_scope_email
        ) AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
              AND COLUMN_NAME = @new_scope_email
        ),
        CONCAT(
            'ALTER TABLE `',
            @new_customization_table,
            '` CHANGE COLUMN `',
            @old_scope_email,
            '` `',
            @new_scope_email,
            '` VARCHAR(255) NULL'
        ),
        'SELECT 1'
    )
);
PREPARE rename_school_email_tb_school_customization_stmt FROM @rename_school_email_tb_school_customization_sql;
EXECUTE rename_school_email_tb_school_customization_stmt;
DEALLOCATE PREPARE rename_school_email_tb_school_customization_stmt;
