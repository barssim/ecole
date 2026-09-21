SET @legacy_scope_column = CONCAT('ten', 'ant_id');
SET @new_scope_column = 'school_id';
SET @legacy_scope_table = CONCAT('tb_school_act', 'ivity');

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @legacy_scope_table
              AND COLUMN_NAME = @legacy_scope_column
        )
        AND NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = @legacy_scope_table
              AND COLUMN_NAME = @new_scope_column
        ),
        CONCAT(
            'ALTER TABLE `',
            @legacy_scope_table,
            '` CHANGE COLUMN `',
            @legacy_scope_column,
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
