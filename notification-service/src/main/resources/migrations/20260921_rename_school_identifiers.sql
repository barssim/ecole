SET @db_name = DATABASE();

SET @legacy_main_table = CONVERT(0x74625f74656e616e74 USING utf8mb4);
SET @legacy_custom_table = CONVERT(0x74625f74656e616e745f637573746f6d697a6174696f6e USING utf8mb4);
SET @legacy_id_col = CONVERT(0x74656e616e745f6964 USING utf8mb4);
SET @legacy_name_col = CONVERT(0x74656e616e745f6e616d65 USING utf8mb4);
SET @legacy_mail_col = CONVERT(0x74656e616e745f656d61696c USING utf8mb4);

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = @legacy_main_table
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school'
        ),
        CONCAT('RENAME TABLE `', @legacy_main_table, '` TO `tb_school`'),
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
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = @legacy_custom_table
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school_customization'
        ),
        CONCAT('RENAME TABLE `', @legacy_custom_table, '` TO `tb_school_customization`'),
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
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school'
              AND COLUMN_NAME = @legacy_id_col
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school'
              AND COLUMN_NAME = 'school_id'
        ),
        (
            SELECT CONCAT(
                'ALTER TABLE `tb_school` CHANGE COLUMN `', @legacy_id_col, '` `school_id` ',
                COLUMN_TYPE,
                CASE WHEN CHARACTER_SET_NAME IS NOT NULL THEN CONCAT(' CHARACTER SET ', CHARACTER_SET_NAME) ELSE '' END,
                CASE WHEN COLLATION_NAME IS NOT NULL THEN CONCAT(' COLLATE ', COLLATION_NAME) ELSE '' END,
                CASE WHEN IS_NULLABLE = 'NO' THEN ' NOT NULL' ELSE ' NULL' END,
                CASE
                    WHEN COLUMN_DEFAULT IS NOT NULL THEN CONCAT(' DEFAULT ', QUOTE(COLUMN_DEFAULT))
                    WHEN IS_NULLABLE = 'YES' THEN ' DEFAULT NULL'
                    ELSE ''
                END,
                CASE WHEN EXTRA <> '' THEN CONCAT(' ', EXTRA) ELSE '' END,
                CASE WHEN COLUMN_COMMENT <> '' THEN CONCAT(' COMMENT ', QUOTE(COLUMN_COMMENT)) ELSE '' END
            )
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school'
              AND COLUMN_NAME = @legacy_id_col
            LIMIT 1
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
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school'
              AND COLUMN_NAME = @legacy_name_col
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school'
              AND COLUMN_NAME = 'school_name'
        ),
        (
            SELECT CONCAT(
                'ALTER TABLE `tb_school` CHANGE COLUMN `', @legacy_name_col, '` `school_name` ',
                COLUMN_TYPE,
                CASE WHEN CHARACTER_SET_NAME IS NOT NULL THEN CONCAT(' CHARACTER SET ', CHARACTER_SET_NAME) ELSE '' END,
                CASE WHEN COLLATION_NAME IS NOT NULL THEN CONCAT(' COLLATE ', COLLATION_NAME) ELSE '' END,
                CASE WHEN IS_NULLABLE = 'NO' THEN ' NOT NULL' ELSE ' NULL' END,
                CASE
                    WHEN COLUMN_DEFAULT IS NOT NULL THEN CONCAT(' DEFAULT ', QUOTE(COLUMN_DEFAULT))
                    WHEN IS_NULLABLE = 'YES' THEN ' DEFAULT NULL'
                    ELSE ''
                END,
                CASE WHEN EXTRA <> '' THEN CONCAT(' ', EXTRA) ELSE '' END,
                CASE WHEN COLUMN_COMMENT <> '' THEN CONCAT(' COMMENT ', QUOTE(COLUMN_COMMENT)) ELSE '' END
            )
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school'
              AND COLUMN_NAME = @legacy_name_col
            LIMIT 1
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
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school'
              AND COLUMN_NAME = @legacy_mail_col
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school'
              AND COLUMN_NAME = 'school_email'
        ),
        (
            SELECT CONCAT(
                'ALTER TABLE `tb_school` CHANGE COLUMN `', @legacy_mail_col, '` `school_email` ',
                COLUMN_TYPE,
                CASE WHEN CHARACTER_SET_NAME IS NOT NULL THEN CONCAT(' CHARACTER SET ', CHARACTER_SET_NAME) ELSE '' END,
                CASE WHEN COLLATION_NAME IS NOT NULL THEN CONCAT(' COLLATE ', COLLATION_NAME) ELSE '' END,
                CASE WHEN IS_NULLABLE = 'NO' THEN ' NOT NULL' ELSE ' NULL' END,
                CASE
                    WHEN COLUMN_DEFAULT IS NOT NULL THEN CONCAT(' DEFAULT ', QUOTE(COLUMN_DEFAULT))
                    WHEN IS_NULLABLE = 'YES' THEN ' DEFAULT NULL'
                    ELSE ''
                END,
                CASE WHEN EXTRA <> '' THEN CONCAT(' ', EXTRA) ELSE '' END,
                CASE WHEN COLUMN_COMMENT <> '' THEN CONCAT(' COMMENT ', QUOTE(COLUMN_COMMENT)) ELSE '' END
            )
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school'
              AND COLUMN_NAME = @legacy_mail_col
            LIMIT 1
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
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school_customization'
              AND COLUMN_NAME = @legacy_id_col
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school_customization'
              AND COLUMN_NAME = 'school_id'
        ),
        (
            SELECT CONCAT(
                'ALTER TABLE `tb_school_customization` CHANGE COLUMN `', @legacy_id_col, '` `school_id` ',
                COLUMN_TYPE,
                CASE WHEN CHARACTER_SET_NAME IS NOT NULL THEN CONCAT(' CHARACTER SET ', CHARACTER_SET_NAME) ELSE '' END,
                CASE WHEN COLLATION_NAME IS NOT NULL THEN CONCAT(' COLLATE ', COLLATION_NAME) ELSE '' END,
                CASE WHEN IS_NULLABLE = 'NO' THEN ' NOT NULL' ELSE ' NULL' END,
                CASE
                    WHEN COLUMN_DEFAULT IS NOT NULL THEN CONCAT(' DEFAULT ', QUOTE(COLUMN_DEFAULT))
                    WHEN IS_NULLABLE = 'YES' THEN ' DEFAULT NULL'
                    ELSE ''
                END,
                CASE WHEN EXTRA <> '' THEN CONCAT(' ', EXTRA) ELSE '' END,
                CASE WHEN COLUMN_COMMENT <> '' THEN CONCAT(' COMMENT ', QUOTE(COLUMN_COMMENT)) ELSE '' END
            )
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db_name
              AND TABLE_NAME = 'tb_school_customization'
              AND COLUMN_NAME = @legacy_id_col
            LIMIT 1
        ),
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
