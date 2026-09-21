SET @old_scope_column = CONCAT('ten', 'ant_id');
SET @new_scope_column = 'school_id';
SET @old_scope_table = CONCAT('tb_', 'ten', 'ant');
SET @new_scope_table = 'tb_school';
SET @old_customization_table = CONCAT('tb_', 'ten', 'ant_customization');
SET @new_customization_table = 'tb_school_customization';
SET @old_name_column = CONCAT('ten', 'ant_name');
SET @new_name_column = 'school_name';
SET @old_email_column = CONCAT('ten', 'ant_email');
SET @new_email_column = 'school_email';

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_schedule_entries'
              AND COLUMN_NAME = @old_scope_column
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_schedule_entries'
              AND COLUMN_NAME = @new_scope_column
        ),
        CONCAT(
            'ALTER TABLE `student_schedule_entries` CHANGE COLUMN `',
            @old_scope_column,
            '` `',
            @new_scope_column,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_schedule_entries'
              AND COLUMN_NAME = @old_scope_column
        )
        AND EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_schedule_entries'
              AND COLUMN_NAME = @new_scope_column
        ),
        CONCAT(
            'UPDATE `student_schedule_entries` SET `',
            @new_scope_column,
            '` = COALESCE(NULLIF(`',
            @new_scope_column,
            '`, ''''), `',
            @old_scope_column,
            '`) WHERE `',
            @old_scope_column,
            '` IS NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_schedule_entries'
              AND COLUMN_NAME = @old_scope_column
        )
        AND EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_schedule_entries'
              AND COLUMN_NAME = @new_scope_column
        ),
        CONCAT('ALTER TABLE `student_schedule_entries` DROP COLUMN `', @old_scope_column, '`'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_grades'
              AND COLUMN_NAME = @old_scope_column
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_grades'
              AND COLUMN_NAME = @new_scope_column
        ),
        CONCAT(
            'ALTER TABLE `student_grades` CHANGE COLUMN `',
            @old_scope_column,
            '` `',
            @new_scope_column,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_grades'
              AND COLUMN_NAME = @old_scope_column
        )
        AND EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_grades'
              AND COLUMN_NAME = @new_scope_column
        ),
        CONCAT(
            'UPDATE `student_grades` SET `',
            @new_scope_column,
            '` = COALESCE(NULLIF(`',
            @new_scope_column,
            '`, ''''), `',
            @old_scope_column,
            '`) WHERE `',
            @old_scope_column,
            '` IS NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_grades'
              AND COLUMN_NAME = @old_scope_column
        )
        AND EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_grades'
              AND COLUMN_NAME = @new_scope_column
        ),
        CONCAT('ALTER TABLE `student_grades` DROP COLUMN `', @old_scope_column, '`'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_exercises'
              AND COLUMN_NAME = @old_scope_column
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_exercises'
              AND COLUMN_NAME = @new_scope_column
        ),
        CONCAT(
            'ALTER TABLE `student_exercises` CHANGE COLUMN `',
            @old_scope_column,
            '` `',
            @new_scope_column,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_exercises'
              AND COLUMN_NAME = @old_scope_column
        )
        AND EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_exercises'
              AND COLUMN_NAME = @new_scope_column
        ),
        CONCAT(
            'UPDATE `student_exercises` SET `',
            @new_scope_column,
            '` = COALESCE(NULLIF(`',
            @new_scope_column,
            '`, ''''), `',
            @old_scope_column,
            '`) WHERE `',
            @old_scope_column,
            '` IS NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_exercises'
              AND COLUMN_NAME = @old_scope_column
        )
        AND EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student_exercises'
              AND COLUMN_NAME = @new_scope_column
        ),
        CONCAT('ALTER TABLE `student_exercises` DROP COLUMN `', @old_scope_column, '`'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @old_scope_table
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
        ),
        CONCAT('RENAME TABLE `', @old_scope_table, '` TO `', @new_scope_table, '`'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @old_customization_table
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
        ),
        CONCAT('RENAME TABLE `', @old_customization_table, '` TO `', @new_customization_table, '`'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
              AND COLUMN_NAME = @old_name_column
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
              AND COLUMN_NAME = @new_name_column
        ),
        CONCAT(
            'ALTER TABLE `',
            @new_scope_table,
            '` CHANGE COLUMN `',
            @old_name_column,
            '` `',
            @new_name_column,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
              AND COLUMN_NAME = @old_email_column
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_scope_table
              AND COLUMN_NAME = @new_email_column
        ),
        CONCAT(
            'ALTER TABLE `',
            @new_scope_table,
            '` CHANGE COLUMN `',
            @old_email_column,
            '` `',
            @new_email_column,
            '` VARCHAR(255) NULL'
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
              AND COLUMN_NAME = @old_name_column
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
              AND COLUMN_NAME = @new_name_column
        ),
        CONCAT(
            'ALTER TABLE `',
            @new_customization_table,
            '` CHANGE COLUMN `',
            @old_name_column,
            '` `',
            @new_name_column,
            '` VARCHAR(255) NOT NULL'
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
              AND COLUMN_NAME = @old_email_column
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @new_customization_table
              AND COLUMN_NAME = @new_email_column
        ),
        CONCAT(
            'ALTER TABLE `',
            @new_customization_table,
            '` CHANGE COLUMN `',
            @old_email_column,
            '` `',
            @new_email_column,
            '` VARCHAR(255) NULL'
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
