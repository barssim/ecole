SET @schema_name = DATABASE();
SET @legacy_id_column = CONCAT('ten', 'ant_id');
SET @legacy_name_column = CONCAT('ten', 'ant_name');
SET @legacy_email_column = CONCAT('ten', 'ant_email');
SET @legacy_table = CONCAT('tb_', 'ten', 'ant');
SET @legacy_customization_table = CONCAT('tb_', 'ten', 'ant_customization');

SET @ddl = (
    SELECT IF(
        EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = @legacy_table
        )
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'tb_school'
        ),
        CONCAT('RENAME TABLE `', @legacy_table, '` TO `tb_school`'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = (
    SELECT IF(
        EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = @legacy_customization_table
        )
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'tb_school_customization'
        ),
        CONCAT('RENAME TABLE `', @legacy_customization_table, '` TO `tb_school_customization`'),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_type = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'teacher_courses'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @nullable = (
    SELECT IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'teacher_courses'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @ddl = (
    SELECT IF(
        @column_type IS NOT NULL
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'teacher_courses'
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT(
            'ALTER TABLE `teacher_courses` CHANGE COLUMN `', @legacy_id_column, '` `school_id` ',
            @column_type, ' ', IF(@nullable = 'NO', 'NOT NULL', 'NULL')
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_type = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'teacher_shared_documents'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @nullable = (
    SELECT IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'teacher_shared_documents'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @ddl = (
    SELECT IF(
        @column_type IS NOT NULL
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'teacher_shared_documents'
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT(
            'ALTER TABLE `teacher_shared_documents` CHANGE COLUMN `', @legacy_id_column, '` `school_id` ',
            @column_type, ' ', IF(@nullable = 'NO', 'NOT NULL', 'NULL')
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_type = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'teacher_parent_meetings'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @nullable = (
    SELECT IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'teacher_parent_meetings'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @ddl = (
    SELECT IF(
        @column_type IS NOT NULL
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'teacher_parent_meetings'
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT(
            'ALTER TABLE `teacher_parent_meetings` CHANGE COLUMN `', @legacy_id_column, '` `school_id` ',
            @column_type, ' ', IF(@nullable = 'NO', 'NOT NULL', 'NULL')
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_type = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'teacher_assignments'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @nullable = (
    SELECT IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'teacher_assignments'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @ddl = (
    SELECT IF(
        @column_type IS NOT NULL
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'teacher_assignments'
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT(
            'ALTER TABLE `teacher_assignments` CHANGE COLUMN `', @legacy_id_column, '` `school_id` ',
            @column_type, ' ', IF(@nullable = 'NO', 'NOT NULL', 'NULL')
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_type = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'tb_professor_attendance'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @nullable = (
    SELECT IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'tb_professor_attendance'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @ddl = (
    SELECT IF(
        @column_type IS NOT NULL
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'tb_professor_attendance'
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT(
            'ALTER TABLE `tb_professor_attendance` CHANGE COLUMN `', @legacy_id_column, '` `school_id` ',
            @column_type, ' ', IF(@nullable = 'NO', 'NOT NULL', 'NULL')
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_type = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'teacher_notes'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @nullable = (
    SELECT IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'teacher_notes'
      AND COLUMN_NAME = @legacy_id_column
    LIMIT 1
);
SET @ddl = (
    SELECT IF(
        @column_type IS NOT NULL
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'teacher_notes'
              AND COLUMN_NAME = 'school_id'
        ),
        CONCAT(
            'ALTER TABLE `teacher_notes` CHANGE COLUMN `', @legacy_id_column, '` `school_id` ',
            @column_type, ' ', IF(@nullable = 'NO', 'NOT NULL', 'NULL')
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_type = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'tb_school'
      AND COLUMN_NAME = @legacy_name_column
    LIMIT 1
);
SET @nullable = (
    SELECT IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'tb_school'
      AND COLUMN_NAME = @legacy_name_column
    LIMIT 1
);
SET @ddl = (
    SELECT IF(
        @column_type IS NOT NULL
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'tb_school'
              AND COLUMN_NAME = 'school_name'
        ),
        CONCAT(
            'ALTER TABLE `tb_school` CHANGE COLUMN `', @legacy_name_column, '` `school_name` ',
            @column_type, ' ', IF(@nullable = 'NO', 'NOT NULL', 'NULL')
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_type = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'tb_school'
      AND COLUMN_NAME = @legacy_email_column
    LIMIT 1
);
SET @nullable = (
    SELECT IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'tb_school'
      AND COLUMN_NAME = @legacy_email_column
    LIMIT 1
);
SET @ddl = (
    SELECT IF(
        @column_type IS NOT NULL
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'tb_school'
              AND COLUMN_NAME = 'school_email'
        ),
        CONCAT(
            'ALTER TABLE `tb_school` CHANGE COLUMN `', @legacy_email_column, '` `school_email` ',
            @column_type, ' ', IF(@nullable = 'NO', 'NOT NULL', 'NULL')
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_type = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'tb_school_customization'
      AND COLUMN_NAME = @legacy_name_column
    LIMIT 1
);
SET @nullable = (
    SELECT IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'tb_school_customization'
      AND COLUMN_NAME = @legacy_name_column
    LIMIT 1
);
SET @ddl = (
    SELECT IF(
        @column_type IS NOT NULL
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'tb_school_customization'
              AND COLUMN_NAME = 'school_name'
        ),
        CONCAT(
            'ALTER TABLE `tb_school_customization` CHANGE COLUMN `', @legacy_name_column, '` `school_name` ',
            @column_type, ' ', IF(@nullable = 'NO', 'NOT NULL', 'NULL')
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_type = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'tb_school_customization'
      AND COLUMN_NAME = @legacy_email_column
    LIMIT 1
);
SET @nullable = (
    SELECT IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'tb_school_customization'
      AND COLUMN_NAME = @legacy_email_column
    LIMIT 1
);
SET @ddl = (
    SELECT IF(
        @column_type IS NOT NULL
        AND NOT EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @schema_name
              AND TABLE_NAME = 'tb_school_customization'
              AND COLUMN_NAME = 'school_email'
        ),
        CONCAT(
            'ALTER TABLE `tb_school_customization` CHANGE COLUMN `', @legacy_email_column, '` `school_email` ',
            @column_type, ' ', IF(@nullable = 'NO', 'NOT NULL', 'NULL')
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
